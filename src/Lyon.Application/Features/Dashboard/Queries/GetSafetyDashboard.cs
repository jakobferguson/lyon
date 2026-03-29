using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using Lyon.Domain.Constants;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Dashboard.Queries;

[Authorize(UserRole.FieldReporter)]
public record GetSafetyDashboardQuery(
    Guid? DivisionId = null,
    Guid? ProjectId = null,
    string? IncidentType = null,
    DateTimeOffset? StartDate = null,
    DateTimeOffset? EndDate = null) : IRequest<DashboardResponse>;

public class GetSafetyDashboardQueryHandler : IRequestHandler<GetSafetyDashboardQuery, DashboardResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _dateTime;

    public GetSafetyDashboardQueryHandler(IApplicationDbContext db, IDateTimeProvider dateTime)
    {
        _db = db;
        _dateTime = dateTime;
    }

    public async Task<DashboardResponse> Handle(GetSafetyDashboardQuery query, CancellationToken ct)
    {
        var now = _dateTime.UtcNow;
        var yearStart = new DateTimeOffset(now.Year, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var startDate = query.StartDate ?? yearStart;
        var endDate = query.EndDate ?? now;

        var incidents = _db.Incidents
            .Where(i => !i.IsDeleted && i.DateTime >= startDate && i.DateTime <= endDate);

        if (query.DivisionId.HasValue)
            incidents = incidents.Where(i => i.DivisionId == query.DivisionId);
        if (query.ProjectId.HasValue)
            incidents = incidents.Where(i => i.ProjectId == query.ProjectId);

        var totalRecordable = await incidents.CountAsync(i => i.IsOshaRecordable == true, ct);
        var totalDart = await incidents.CountAsync(i => i.IsDart == true, ct);
        var totalNearMiss = await incidents.CountAsync(i => i.IncidentType == Domain.Enums.IncidentType.NearMiss, ct);

        var hoursQuery = _db.HoursWorkedEntries
            .Where(h => h.Year == now.Year && h.DivisionId == null);
        var totalHours = await hoursQuery.SumAsync(h => (decimal?)h.Hours, ct) ?? 0m;

        var trir = totalHours > 0 ? totalRecordable * OshaRules.HoursMultiplier / totalHours : 0;
        var dartRate = totalHours > 0 ? totalDart * OshaRules.HoursMultiplier / totalHours : 0;
        var nearMissRatio = totalRecordable > 0 ? (decimal)totalNearMiss / totalRecordable : 0;

        var openInvestigations = await _db.Investigations
            .CountAsync(i => !i.IsDeleted && i.Status != InvestigationStatus.Approved, ct);
        var openCapas = await _db.Capas
            .CountAsync(c => !c.IsDeleted && c.Status != CapaStatus.VerifiedEffective && c.Status != CapaStatus.VerifiedIneffective, ct);

        var lostWorkDaysYtd = await _db.InjuredPersons
            .Where(ip => ip.Incident.DateTime >= yearStart && ip.Incident.DateTime <= now && ip.DaysAway != null)
            .CountAsync(ct); // Simplified; actual sum requires decryption

        return new DashboardResponse
        {
            Kpis = new DashboardKpiResponse
            {
                Trir = trir,
                TrirTrend = 0,
                DartRate = dartRate,
                DartRateTrend = 0,
                NearMissRatio = nearMissRatio,
                NearMissRatioTrend = 0,
                OpenInvestigations = openInvestigations,
                OpenCapas = openCapas,
                LostWorkDaysYtd = lostWorkDaysYtd,
            },
            IncidentTrend = [],
            TrirTrend = [],
            DivisionBreakdown = [],
            SeverityDistribution = [],
            LeadingIndicators = new LeadingIndicatorsResponse
            {
                NearMissReportingRate = 0,
                NearMissTarget = 1.0m,
                CapaClosureRate = 0,
                CapaClosureTarget = 0.85m,
                InvestigationTimeliness = 0,
                InvestigationTimelinessTarget = 0.90m,
            },
            RecentIncidents = [],
        };
    }
}

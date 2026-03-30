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

        // ── Incident trend (monthly counts by type, last 12 months) ────────
        var trendStart = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero).AddMonths(-11);
        var incidentTrend = await _db.Incidents
            .Where(i => !i.IsDeleted && i.DateTime >= trendStart && i.DateTime <= endDate)
            .GroupBy(i => new { i.DateTime.Year, i.DateTime.Month, i.IncidentType })
            .Select(g => new MonthlyTrendPoint
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Value = g.Count(),
                Category = g.Key.IncidentType.ToString(),
            })
            .OrderBy(p => p.Year).ThenBy(p => p.Month)
            .ToListAsync(ct);

        // ── TRIR trend (monthly) ────────────────────────────────────────────
        var monthlyRecordable = await _db.Incidents
            .Where(i => !i.IsDeleted && i.IsOshaRecordable == true && i.DateTime >= trendStart && i.DateTime <= endDate)
            .GroupBy(i => new { i.DateTime.Year, i.DateTime.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync(ct);

        var monthlyHours = await _db.HoursWorkedEntries
            .Where(h => h.DivisionId == null)
            .Where(h => (h.Year > trendStart.Year || (h.Year == trendStart.Year && h.Month >= trendStart.Month))
                     && (h.Year < now.Year || (h.Year == now.Year && h.Month <= now.Month)))
            .ToListAsync(ct);

        var trirTrendData = monthlyHours
            .Select(h =>
            {
                var recordable = monthlyRecordable
                    .FirstOrDefault(r => r.Year == h.Year && r.Month == h.Month)?.Count ?? 0;
                var rate = h.Hours > 0 ? recordable * OshaRules.HoursMultiplier / h.Hours : 0;
                return new MonthlyTrendPoint { Year = h.Year, Month = h.Month, Value = rate };
            })
            .OrderBy(p => p.Year).ThenBy(p => p.Month)
            .ToList();

        // ── Division breakdown ──────────────────────────────────────────────
        var divisionBreakdown = await _db.Incidents
            .Where(i => !i.IsDeleted && i.DateTime >= startDate && i.DateTime <= endDate)
            .Where(i => i.Division != null)
            .GroupBy(i => new { Division = i.Division!.Name, i.IncidentType })
            .Select(g => new DivisionBreakdownItem
            {
                Division = g.Key.Division,
                IncidentType = g.Key.IncidentType.ToString(),
                Count = g.Count(),
            })
            .ToListAsync(ct);

        // ── Severity distribution ───────────────────────────────────────────
        var severityDistribution = await _db.Incidents
            .Where(i => !i.IsDeleted && i.DateTime >= startDate && i.DateTime <= endDate && i.Severity != null)
            .GroupBy(i => i.Severity!)
            .Select(g => new SeverityDistributionItem
            {
                Severity = g.Key.ToString()!,
                Count = g.Count(),
            })
            .ToListAsync(ct);

        // ── Recent incidents (latest 10) ────────────────────────────────────
        var recentIncidents = await _db.Incidents
            .Include(i => i.ReportedBy)
            .Include(i => i.Division)
            .Where(i => !i.IsDeleted)
            .OrderByDescending(i => i.DateTime)
            .Take(10)
            .Select(i => new IncidentListItemResponse
            {
                Id = i.Id,
                IncidentNumber = i.IncidentNumber,
                IncidentType = i.IncidentType.ToString(),
                DateTime = i.DateTime,
                Division = i.Division != null ? i.Division.Name : null,
                Project = null,
                Severity = i.Severity != null ? i.Severity.ToString() : null,
                Status = i.Status.ToString(),
                Description = i.Description,
                ReportedBy = i.ReportedBy != null ? i.ReportedBy.DisplayName : "Unknown",
                Location = new LocationResponse
                {
                    Latitude = i.LocationLatitude,
                    Longitude = i.LocationLongitude,
                    TextDescription = i.LocationDescription,
                    GpsSource = i.LocationGpsSource,
                },
            })
            .ToListAsync(ct);

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
            IncidentTrend = incidentTrend,
            TrirTrend = trirTrendData,
            DivisionBreakdown = divisionBreakdown,
            SeverityDistribution = severityDistribution,
            LeadingIndicators = new LeadingIndicatorsResponse
            {
                NearMissReportingRate = 0,
                NearMissTarget = 1.0m,
                CapaClosureRate = 0,
                CapaClosureTarget = 0.85m,
                InvestigationTimeliness = 0,
                InvestigationTimelinessTarget = 0.90m,
            },
            RecentIncidents = recentIncidents,
        };
    }
}

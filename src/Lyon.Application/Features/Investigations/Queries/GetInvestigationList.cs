using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Application.Common.Models;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Investigations.Queries;

[Authorize(UserRole.SafetyCoordinator)]
public record GetInvestigationListQuery(
    int PageNumber = 1,
    int PageSize = 20,
    string? Status = null,
    string? Search = null) : IRequest<PaginatedList<InvestigationListItemResponse>>;

public class GetInvestigationListQueryHandler
    : IRequestHandler<GetInvestigationListQuery, PaginatedList<InvestigationListItemResponse>>
{
    private readonly IApplicationDbContext _db;

    public GetInvestigationListQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PaginatedList<InvestigationListItemResponse>> Handle(
        GetInvestigationListQuery query, CancellationToken ct)
    {
        var q = _db.Investigations
            .Include(i => i.Incident).ThenInclude(inc => inc.Division)
            .Include(i => i.Incident).ThenInclude(inc => inc.Project)
            .Include(i => i.LeadInvestigator)
            .Where(i => !i.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Status) &&
            Enum.TryParse<InvestigationStatus>(query.Status.Replace(" ", ""), true, out var status))
        {
            q = q.Where(i => i.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            q = q.Where(i =>
                i.Incident.IncidentNumber.ToLower().Contains(search) ||
                (i.Incident.Division != null && i.Incident.Division.Name.ToLower().Contains(search)) ||
                (i.Incident.Project != null && i.Incident.Project.Name.ToLower().Contains(search)) ||
                i.LeadInvestigator.DisplayName.ToLower().Contains(search));
        }

        var projected = q.OrderByDescending(i => i.CreatedAt)
            .Select(i => new InvestigationListItemResponse
            {
                Id = i.Id,
                IncidentId = i.IncidentId,
                IncidentNumber = i.Incident.IncidentNumber,
                Status = i.Status.ToString(),
                Severity = i.Incident.Severity != null ? i.Incident.Severity.ToString()! : "Unknown",
                Division = i.Incident.Division != null ? i.Incident.Division.Name : null,
                Project = i.Incident.Project != null ? i.Incident.Project.Name : null,
                LeadInvestigator = i.LeadInvestigator.DisplayName,
                TargetCompletionDate = i.TargetCompletionDate,
                InvestigationNumber = i.InvestigationNumber,
                CreatedAt = i.CreatedAt,
            });

        return await PaginatedList<InvestigationListItemResponse>.CreateAsync(
            projected, query.PageNumber, query.PageSize, ct);
    }
}

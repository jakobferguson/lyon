using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Application.Common.Models;
using Lyon.Contracts.Common;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Capas.Queries;

[Authorize(UserRole.SafetyCoordinator)]
public record GetCapaListQuery(
    int PageNumber = 1,
    int PageSize = 20,
    string? Status = null,
    string? Priority = null,
    Guid? AssignedToId = null,
    Guid? IncidentId = null) : IRequest<PaginatedResponse<CapaListItemResponse>>;

public class GetCapaListQueryHandler : IRequestHandler<GetCapaListQuery, PaginatedResponse<CapaListItemResponse>>
{
    private readonly IApplicationDbContext _db;

    public GetCapaListQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PaginatedResponse<CapaListItemResponse>> Handle(GetCapaListQuery query, CancellationToken ct)
    {
        var q = _db.Capas
            .Include(c => c.AssignedTo)
            .Include(c => c.CapaIncidents)
            .Where(c => !c.IsDeleted)
            .AsQueryable();

        if (query.Status is not null && Enum.TryParse<CapaStatus>(query.Status.Replace(" ", ""), ignoreCase: true, out var status))
            q = q.Where(c => c.Status == status);
        if (query.Priority is not null && Enum.TryParse<CapaPriority>(query.Priority, ignoreCase: true, out var priority))
            q = q.Where(c => c.Priority == priority);
        if (query.AssignedToId.HasValue)
            q = q.Where(c => c.AssignedToId == query.AssignedToId);
        if (query.IncidentId.HasValue)
            q = q.Where(c => c.CapaIncidents.Any(ci => ci.IncidentId == query.IncidentId));

        q = q.OrderByDescending(c => c.CreatedAt);

        var paginated = await PaginatedList<CapaListItemResponse>.CreateAsync(
            q.Select(c => new CapaListItemResponse
            {
                Id = c.Id,
                CapaNumber = c.CapaNumber,
                Type = c.Type.ToString(),
                Category = c.Category.ToString(),
                Description = c.Description,
                AssignedTo = c.AssignedTo.DisplayName,
                Priority = c.Priority.ToString(),
                Status = c.Status.ToString(),
                DueDate = c.DueDate,
                VerificationDueDate = c.VerificationDueDate,
                LinkedIncidentCount = c.CapaIncidents.Count,
            }),
            query.PageNumber, query.PageSize, ct);

        return new PaginatedResponse<CapaListItemResponse>(
            paginated.Items, paginated.PageNumber, paginated.PageSize, paginated.TotalCount);
    }
}

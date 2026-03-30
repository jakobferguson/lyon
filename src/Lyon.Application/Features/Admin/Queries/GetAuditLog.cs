using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Application.Common.Models;
using Lyon.Contracts.Common;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;

namespace Lyon.Application.Features.Admin.Queries;

[Authorize(UserRole.Admin)]
public record GetAuditLogQuery(
    int PageNumber = 1,
    int PageSize = 50,
    string? EntityType = null,
    Guid? EntityId = null,
    string? Action = null,
    DateTimeOffset? StartDate = null,
    DateTimeOffset? EndDate = null) : IRequest<PaginatedResponse<AuditLogEntryResponse>>;

public class GetAuditLogQueryHandler : IRequestHandler<GetAuditLogQuery, PaginatedResponse<AuditLogEntryResponse>>
{
    private readonly IApplicationDbContext _db;

    public GetAuditLogQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PaginatedResponse<AuditLogEntryResponse>> Handle(GetAuditLogQuery query, CancellationToken ct)
    {
        var q = _db.AuditLogEntries.AsQueryable();

        if (query.EntityType is not null) q = q.Where(a => a.EntityType == query.EntityType);
        if (query.EntityId.HasValue) q = q.Where(a => a.EntityId == query.EntityId);
        if (query.Action is not null && Enum.TryParse<AuditAction>(query.Action, ignoreCase: true, out var action))
            q = q.Where(a => a.Action == action);
        if (query.StartDate.HasValue) q = q.Where(a => a.Timestamp >= query.StartDate);
        if (query.EndDate.HasValue) q = q.Where(a => a.Timestamp <= query.EndDate);

        q = q.OrderByDescending(a => a.Timestamp);

        var paginated = await PaginatedList<AuditLogEntryResponse>.CreateAsync(
            q.Select(a => new AuditLogEntryResponse
            {
                Id = a.Id,
                Timestamp = a.Timestamp,
                UserDisplayName = a.UserDisplayName,
                Action = a.Action.ToString(),
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                FieldName = a.FieldName,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                Justification = a.Justification,
            }),
            query.PageNumber, query.PageSize, ct);

        return new PaginatedResponse<AuditLogEntryResponse>(
            paginated.Items, paginated.PageNumber, paginated.PageSize, paginated.TotalCount);
    }
}

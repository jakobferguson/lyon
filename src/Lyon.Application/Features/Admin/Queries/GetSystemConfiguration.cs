using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Admin.Queries;

[Authorize(UserRole.FieldReporter)]
public record GetDivisionsQuery : IRequest<IReadOnlyList<DivisionResponse>>;

public class GetDivisionsQueryHandler : IRequestHandler<GetDivisionsQuery, IReadOnlyList<DivisionResponse>>
{
    private readonly IApplicationDbContext _db;
    public GetDivisionsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<DivisionResponse>> Handle(GetDivisionsQuery query, CancellationToken ct)
        => await _db.Divisions.Where(d => d.IsActive).Select(d => new DivisionResponse
        {
            Id = d.Id,
            Code = d.Code,
            Name = d.Name,
            IsActive = d.IsActive,
        }).ToListAsync(ct);
}

[Authorize(UserRole.FieldReporter)]
public record GetProjectsQuery(Guid? DivisionId = null) : IRequest<IReadOnlyList<ProjectResponse>>;

public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, IReadOnlyList<ProjectResponse>>
{
    private readonly IApplicationDbContext _db;
    public GetProjectsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<ProjectResponse>> Handle(GetProjectsQuery query, CancellationToken ct)
    {
        var q = _db.Projects.Include(p => p.Division).Where(p => p.IsActive).AsQueryable();
        if (query.DivisionId.HasValue) q = q.Where(p => p.DivisionId == query.DivisionId);

        return await q.Select(p => new ProjectResponse
        {
            Id = p.Id,
            Name = p.Name,
            Code = p.Code,
            DivisionId = p.DivisionId,
            Division = p.Division.Name,
            IsActive = p.IsActive,
        }).ToListAsync(ct);
    }
}

[Authorize(UserRole.FieldReporter)]
public record GetRailroadsQuery : IRequest<IReadOnlyList<RailroadResponse>>;

public class GetRailroadsQueryHandler : IRequestHandler<GetRailroadsQuery, IReadOnlyList<RailroadResponse>>
{
    private readonly IApplicationDbContext _db;
    public GetRailroadsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<RailroadResponse>> Handle(GetRailroadsQuery query, CancellationToken ct)
        => await _db.Railroads
            .Include(r => r.NotificationRules)
            .Where(r => r.IsActive)
            .Select(r => new RailroadResponse
            {
                Id = r.Id,
                Name = r.Name,
                Code = r.Code,
                IsActive = r.IsActive,
                NotificationRules = r.NotificationRules.Select(nr => new RailroadNotificationRuleResponse
                {
                    Id = nr.Id,
                    IncidentType = nr.IncidentType.ToString(),
                    DeadlineMinutes = nr.DeadlineMinutes,
                    IsWithinShift = nr.IsWithinShift,
                }).ToList(),
            }).ToListAsync(ct);
}

[Authorize(UserRole.FieldReporter)]
public record GetFactorTypesQuery : IRequest<IReadOnlyList<FactorTypeResponse>>;

public class GetFactorTypesQueryHandler : IRequestHandler<GetFactorTypesQuery, IReadOnlyList<FactorTypeResponse>>
{
    private readonly IApplicationDbContext _db;
    public GetFactorTypesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<FactorTypeResponse>> Handle(GetFactorTypesQuery query, CancellationToken ct)
        => await _db.FactorTypes
            .Where(f => f.IsActive)
            .OrderBy(f => f.Category).ThenBy(f => f.SortOrder)
            .Select(f => new FactorTypeResponse
            {
                Id = f.Id,
                Category = f.Category.ToString(),
                Name = f.Name,
                Description = f.Description,
                IsActive = f.IsActive,
                SortOrder = f.SortOrder,
            }).ToListAsync(ct);
}

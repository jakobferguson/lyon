using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Application.Common.Models;
using Lyon.Contracts.Common;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Incidents.Queries;

[Authorize(UserRole.FieldReporter)]
public record GetIncidentListQuery(
    int PageNumber = 1,
    int PageSize = 20,
    string? Status = null,
    string? IncidentType = null,
    Guid? DivisionId = null,
    string? Search = null,
    string SortBy = "dateTime",
    bool SortDesc = true) : IRequest<PaginatedResponse<IncidentListItemResponse>>;

public class GetIncidentListQueryHandler : IRequestHandler<GetIncidentListQuery, PaginatedResponse<IncidentListItemResponse>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetIncidentListQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PaginatedResponse<IncidentListItemResponse>> Handle(
        GetIncidentListQuery query, CancellationToken cancellationToken)
    {
        var q = _db.Incidents
            .Include(i => i.ReportedBy)
            .Include(i => i.Division)
            .Include(i => i.Project)
            .Where(i => !i.IsDeleted)
            .AsQueryable();

        // Role-based scoping
        if (_currentUser.Role == UserRole.FieldReporter)
            q = q.Where(i => i.ReportedById == _currentUser.UserId);
        else if (_currentUser.Role == UserRole.ProjectManager)
            q = q.Where(i => i.Project != null && i.Project.DivisionId == _currentUser.DivisionId);
        else if (_currentUser.Role == UserRole.DivisionManager)
            q = q.Where(i => i.DivisionId == _currentUser.DivisionId);

        // Filters
        if (query.Status is not null && Enum.TryParse<IncidentStatus>(query.Status.Replace(" ", ""), ignoreCase: true, out var status))
            q = q.Where(i => i.Status == status);
        if (query.IncidentType is not null && Enum.TryParse<IncidentType>(query.IncidentType.Replace(" ", ""), ignoreCase: true, out var incType))
            q = q.Where(i => i.IncidentType == incType);
        if (query.DivisionId.HasValue)
            q = q.Where(i => i.DivisionId == query.DivisionId);
        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(i => i.Description.Contains(query.Search) || i.IncidentNumber.Contains(query.Search));

        // Sorting
        q = query.SortBy.ToLowerInvariant() switch
        {
            "incidentnumber" => query.SortDesc ? q.OrderByDescending(i => i.IncidentNumber) : q.OrderBy(i => i.IncidentNumber),
            "status" => query.SortDesc ? q.OrderByDescending(i => i.Status) : q.OrderBy(i => i.Status),
            "severity" => query.SortDesc ? q.OrderByDescending(i => i.Severity) : q.OrderBy(i => i.Severity),
            _ => query.SortDesc ? q.OrderByDescending(i => i.DateTime) : q.OrderBy(i => i.DateTime),
        };

        var paginated = await PaginatedList<IncidentListItemResponse>.CreateAsync(
            q.Select(i => new IncidentListItemResponse
            {
                Id = i.Id,
                IncidentNumber = i.IncidentNumber,
                IncidentType = i.IncidentType.ToString(),
                DateTime = i.DateTime,
                Division = i.Division != null ? i.Division.Name : null,
                Project = i.Project != null ? i.Project.Name : null,
                Severity = i.Severity != null ? i.Severity.ToString() : null,
                Status = i.Status.ToString(),
                Description = i.Description,
                ReportedBy = i.ReportedBy.DisplayName,
                Location = new LocationResponse
                {
                    Latitude = i.LocationLatitude,
                    Longitude = i.LocationLongitude,
                    TextDescription = i.LocationDescription,
                    GpsSource = i.LocationGpsSource,
                },
            }),
            query.PageNumber,
            query.PageSize,
            cancellationToken);

        return new PaginatedResponse<IncidentListItemResponse>(
            paginated.Items, paginated.PageNumber, paginated.PageSize, paginated.TotalCount);
    }
}

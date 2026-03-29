using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Incidents.Queries;

[Authorize(UserRole.FieldReporter)]
public record GetIncidentByIdQuery(Guid Id) : IRequest<IncidentDetailResponse>;

public class GetIncidentByIdQueryHandler : IRequestHandler<GetIncidentByIdQuery, IncidentDetailResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _storage;

    public GetIncidentByIdQueryHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IFileStorageService storage)
    {
        _db = db;
        _currentUser = currentUser;
        _storage = storage;
    }

    public async Task<IncidentDetailResponse> Handle(GetIncidentByIdQuery query, CancellationToken cancellationToken)
    {
        var i = await _db.Incidents
            .Include(x => x.ReportedBy)
            .Include(x => x.Division)
            .Include(x => x.Project)
            .Include(x => x.Railroad)
            .Include(x => x.InjuredPersons).ThenInclude(ip => ip.Division)
            .Include(x => x.Photos)
            .Include(x => x.RailroadNotifications).ThenInclude(rn => rn.Railroad)
            .FirstOrDefaultAsync(x => x.Id == query.Id && !x.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Incident {query.Id} not found.");

        var canSeeMedical = _currentUser.CanAccessMedicalData();

        return new IncidentDetailResponse
        {
            Id = i.Id,
            IncidentNumber = i.IncidentNumber,
            IncidentType = i.IncidentType.ToString(),
            DateTime = i.DateTime,
            TimezoneId = i.TimezoneId,
            Description = i.Description,
            Severity = i.Severity?.ToString(),
            PotentialSeverity = i.PotentialSeverity?.ToString(),
            Status = i.Status.ToString(),
            Location = new LocationResponse
            {
                Latitude = i.LocationLatitude,
                Longitude = i.LocationLongitude,
                TextDescription = i.LocationDescription,
                GpsSource = i.LocationGpsSource,
            },
            ImmediateActions = i.ImmediateActions,
            Shift = i.Shift?.ToString(),
            ShiftStart = i.ShiftStart?.ToString("HH:mm"),
            ShiftEnd = i.ShiftEnd?.ToString("HH:mm"),
            Weather = i.Weather?.ToString(),
            OnRailroadProperty = i.OnRailroadProperty,
            DivisionId = i.DivisionId,
            Division = i.Division?.Name,
            ProjectId = i.ProjectId,
            Project = i.Project?.Name,
            RailroadId = i.RailroadId,
            Railroad = i.Railroad?.Name,
            IsOshaRecordable = i.IsOshaRecordable,
            IsDart = i.IsDart,
            OshaOverrideJustification = i.OshaOverrideJustification,
            ReopenCount = i.ReopenCount,
            ReportedBy = i.ReportedBy != null ? i.ReportedBy.DisplayName : "Unknown",
            ReportedById = i.ReportedById,
            CreatedAt = i.CreatedAt,
            UpdatedAt = i.UpdatedAt,
            InjuredPersons = i.InjuredPersons.Select(ip => new InjuredPersonResponse
            {
                Id = ip.Id,
                Name = canSeeMedical ? ip.Name.Value : "[REDACTED]",
                JobTitle = ip.JobTitle,
                Division = ip.Division?.Name,
                InjuryType = ip.InjuryType?.ToString(),
                BodyPart = ip.BodyPart?.ToString(),
                BodySide = ip.BodySide?.ToString(),
                TreatmentType = canSeeMedical ? ip.TreatmentType?.Value : "[REDACTED]",
                ReturnToWorkStatus = canSeeMedical ? ip.ReturnToWorkStatus?.Value : "[REDACTED]",
                DaysAway = canSeeMedical && ip.DaysAway is not null ? int.TryParse(ip.DaysAway.Value, out var da) ? da : null : null,
                DaysRestricted = canSeeMedical && ip.DaysRestricted is not null ? int.TryParse(ip.DaysRestricted.Value, out var dr) ? dr : null : null,
            }).ToList(),
            Photos = i.Photos.OrderBy(p => p.SortOrder).Select(p => new IncidentPhotoResponse
            {
                Id = p.Id,
                FileName = p.FileName,
                Url = _storage.GetPublicUrl(p.StoragePath),
                ContentType = p.ContentType,
                FileSizeBytes = p.FileSizeBytes,
                SortOrder = p.SortOrder,
            }).ToList(),
            RailroadNotification = i.RailroadNotifications.Select(rn => new RailroadNotificationResponse
            {
                Id = rn.Id,
                Railroad = rn.Railroad.Name,
                WasNotified = rn.WasNotified,
                NotificationDateTime = rn.NotificationDateTime,
                Method = rn.Method?.ToString(),
                PersonNotified = rn.PersonNotified,
                PersonTitle = rn.PersonTitle,
                Notes = rn.Notes,
                Deadline = rn.Deadline,
                IsOverdue = rn.IsOverdue,
            }).FirstOrDefault(),
        };
    }
}

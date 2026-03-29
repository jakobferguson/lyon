using FluentValidation;
using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Requests;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Incidents.Commands;

[Authorize(UserRole.FieldReporter)]
public record UpdateIncidentCommand(Guid IncidentId, UpdateIncidentRequest Request) : IRequest<IncidentDetailResponse>;

public class UpdateIncidentCommandValidator : AbstractValidator<UpdateIncidentCommand>
{
    public UpdateIncidentCommandValidator()
    {
        RuleFor(x => x.IncidentId).NotEmpty();
    }
}

public class UpdateIncidentCommandHandler : IRequestHandler<UpdateIncidentCommand, IncidentDetailResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public UpdateIncidentCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IDateTimeProvider dateTime)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<IncidentDetailResponse> Handle(UpdateIncidentCommand command, CancellationToken cancellationToken)
    {
        var incident = await _db.Incidents
            .Include(i => i.ReportedBy)
            .Include(i => i.Division)
            .Include(i => i.Project)
            .Include(i => i.Railroad)
            .FirstOrDefaultAsync(i => i.Id == command.IncidentId && !i.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Incident {command.IncidentId} not found.");

        var req = command.Request;

        if (req.Description is not null) incident.Description = req.Description;
        if (req.LocationDescription is not null) incident.LocationDescription = req.LocationDescription;
        if (req.LocationLatitude.HasValue) incident.LocationLatitude = req.LocationLatitude;
        if (req.LocationLongitude.HasValue) incident.LocationLongitude = req.LocationLongitude;
        if (req.LocationGpsSource is not null) incident.LocationGpsSource = req.LocationGpsSource;
        if (req.TimezoneId is not null) incident.TimezoneId = req.TimezoneId;
        if (req.DateTime.HasValue) incident.DateTime = req.DateTime.Value;
        if (req.DivisionId.HasValue) incident.DivisionId = req.DivisionId;
        if (req.ProjectId.HasValue) incident.ProjectId = req.ProjectId;
        if (req.ImmediateActions is not null) incident.ImmediateActions = req.ImmediateActions;
        if (req.OnRailroadProperty.HasValue) incident.OnRailroadProperty = req.OnRailroadProperty.Value;
        if (req.RailroadId.HasValue) incident.RailroadId = req.RailroadId;
        if (req.IsOshaRecordable.HasValue) incident.IsOshaRecordable = req.IsOshaRecordable;
        if (req.IsDart.HasValue) incident.IsDart = req.IsDart;
        if (req.OshaOverrideJustification is not null) incident.OshaOverrideJustification = req.OshaOverrideJustification;

        if (Enum.TryParse<IncidentType>(req.IncidentType?.Replace(" ", ""), ignoreCase: true, out var incType))
            incident.IncidentType = incType;
        if (Enum.TryParse<Lyon.Domain.Enums.Severity>(req.Severity?.Replace(" ", ""), ignoreCase: true, out var sev))
            incident.Severity = sev;
        if (Enum.TryParse<Lyon.Domain.Enums.Severity>(req.PotentialSeverity?.Replace(" ", ""), ignoreCase: true, out var pSev))
            incident.PotentialSeverity = pSev;
        if (Enum.TryParse<Shift>(req.Shift, ignoreCase: true, out var shift))
            incident.Shift = shift;
        if (TimeOnly.TryParse(req.ShiftStart, out var ss))
            incident.ShiftStart = ss;
        if (TimeOnly.TryParse(req.ShiftEnd, out var se))
            incident.ShiftEnd = se;
        if (Enum.TryParse<WeatherCondition>(req.Weather?.Replace(" ", ""), ignoreCase: true, out var w))
            incident.Weather = w;

        incident.UpdatedAt = _dateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return new IncidentDetailResponse
        {
            Id = incident.Id,
            IncidentNumber = incident.IncidentNumber,
            IncidentType = incident.IncidentType.ToString(),
            DateTime = incident.DateTime,
            TimezoneId = incident.TimezoneId,
            Description = incident.Description,
            Severity = incident.Severity?.ToString(),
            PotentialSeverity = incident.PotentialSeverity?.ToString(),
            Status = incident.Status.ToString(),
            Location = new LocationResponse
            {
                Latitude = incident.LocationLatitude,
                Longitude = incident.LocationLongitude,
                TextDescription = incident.LocationDescription,
                GpsSource = incident.LocationGpsSource,
            },
            ImmediateActions = incident.ImmediateActions,
            Shift = incident.Shift?.ToString(),
            ShiftStart = incident.ShiftStart?.ToString("HH:mm"),
            ShiftEnd = incident.ShiftEnd?.ToString("HH:mm"),
            Weather = incident.Weather?.ToString(),
            OnRailroadProperty = incident.OnRailroadProperty,
            DivisionId = incident.DivisionId,
            Division = incident.Division?.Name,
            ProjectId = incident.ProjectId,
            Project = incident.Project?.Name,
            RailroadId = incident.RailroadId,
            Railroad = incident.Railroad?.Name,
            IsOshaRecordable = incident.IsOshaRecordable,
            IsDart = incident.IsDart,
            OshaOverrideJustification = incident.OshaOverrideJustification,
            ReopenCount = incident.ReopenCount,
            ReportedBy = incident.ReportedBy.DisplayName,
            ReportedById = incident.ReportedById,
            CreatedAt = incident.CreatedAt,
            UpdatedAt = incident.UpdatedAt,
        };
    }
}

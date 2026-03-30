using FluentValidation;
using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Requests;
using Lyon.Contracts.Responses;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Incidents.Commands;

[Authorize(UserRole.FieldReporter)]
public record CreateIncidentCommand(CreateIncidentRequest Request) : IRequest<IncidentDetailResponse>;

public class CreateIncidentCommandValidator : AbstractValidator<CreateIncidentCommand>
{
    public CreateIncidentCommandValidator()
    {
        RuleFor(x => x.Request.IncidentType).NotEmpty()
            .Must(v => Enum.TryParse<IncidentType>(v?.Replace(" ", ""), ignoreCase: true, out _))
            .WithMessage("Invalid incident type.");
        RuleFor(x => x.Request.DateTime).NotEmpty();
        RuleFor(x => x.Request.Description).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Request.LocationDescription).NotEmpty().MaximumLength(500);
    }
}

public class CreateIncidentCommandHandler : IRequestHandler<CreateIncidentCommand, IncidentDetailResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public CreateIncidentCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTime)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<IncidentDetailResponse> Handle(CreateIncidentCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;

        var incidentNumber = await GenerateIncidentNumberAsync(cancellationToken);

        if (!Enum.TryParse<IncidentType>(req.IncidentType.Replace(" ", ""), ignoreCase: true, out var parsedType))
            throw new Lyon.Domain.Exceptions.DomainException($"Invalid incident type: {req.IncidentType}");

        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            IncidentNumber = incidentNumber,
            IncidentType = parsedType,
            DateTime = req.DateTime,
            TimezoneId = req.TimezoneId ?? "America/Chicago",
            Description = req.Description,
            LocationDescription = req.LocationDescription,
            LocationLatitude = req.LocationLatitude,
            LocationLongitude = req.LocationLongitude,
            LocationGpsSource = req.LocationGpsSource,
            ReportedById = _currentUser.UserId,
            Status = req.SubmitAsReported ? IncidentStatus.Reported : IncidentStatus.Draft,
            DivisionId = req.DivisionId,
            ProjectId = req.ProjectId,
            ImmediateActions = req.ImmediateActions,
            OnRailroadProperty = req.OnRailroadProperty,
            RailroadId = req.RailroadId,
            IsOshaRecordable = req.IsOshaRecordable,
            IsDart = req.IsDart,
            OshaOverrideJustification = req.OshaOverrideJustification,
            OshaDeterminedById = req.IsOshaRecordable.HasValue ? _currentUser.UserId : null,
            CreatedAt = _dateTime.UtcNow,
            UpdatedAt = _dateTime.UtcNow,
        };

        if (Enum.TryParse<Lyon.Domain.Enums.Severity>(req.Severity?.Replace(" ", ""), ignoreCase: true, out var severity))
            incident.Severity = severity;
        if (Enum.TryParse<Lyon.Domain.Enums.Severity>(req.PotentialSeverity?.Replace(" ", ""), ignoreCase: true, out var potSev))
            incident.PotentialSeverity = potSev;
        if (Enum.TryParse<Shift>(req.Shift, ignoreCase: true, out var shift))
            incident.Shift = shift;
        if (TimeOnly.TryParse(req.ShiftStart, out var shiftStart))
            incident.ShiftStart = shiftStart;
        if (TimeOnly.TryParse(req.ShiftEnd, out var shiftEnd))
            incident.ShiftEnd = shiftEnd;
        if (Enum.TryParse<WeatherCondition>(req.Weather?.Replace(" ", ""), ignoreCase: true, out var weather))
            incident.Weather = weather;

        if (req.SubmitAsReported)
            incident.MarkAsReported();

        _db.Incidents.Add(incident);

        // Add injured persons
        if (req.InjuredPersons is { Count: > 0 })
        {
            foreach (var ip in req.InjuredPersons)
            {
                var injured = new InjuredPerson
                {
                    Id = Guid.NewGuid(),
                    IncidentId = incident.Id,
                    Name = ip.Name,
                    JobTitle = ip.JobTitle,
                    DivisionId = ip.DivisionId,
                    CreatedAt = _dateTime.UtcNow,
                    UpdatedAt = _dateTime.UtcNow,
                };

                if (Enum.TryParse<InjuryType>(ip.InjuryType?.Replace("/", "").Replace(" ", ""), ignoreCase: true, out var injType))
                    injured.InjuryType = injType;
                if (Enum.TryParse<BodyPart>(ip.BodyPart, ignoreCase: true, out var bp))
                    injured.BodyPart = bp;
                if (Enum.TryParse<BodySide>(ip.BodySide?.Replace("/", ""), ignoreCase: true, out var bs))
                    injured.BodySide = bs;
                if (ip.TreatmentType is not null)
                    injured.TreatmentType = ip.TreatmentType;
                if (ip.ReturnToWorkStatus is not null)
                    injured.ReturnToWorkStatus = ip.ReturnToWorkStatus;
                if (ip.DaysAway.HasValue)
                    injured.DaysAway = ip.DaysAway.Value.ToString();
                if (ip.DaysRestricted.HasValue)
                    injured.DaysRestricted = ip.DaysRestricted.Value.ToString();

                _db.InjuredPersons.Add(injured);
            }
        }

        // Add railroad notification if applicable
        if (req.RailroadNotification is not null && incident.RailroadId.HasValue)
        {
            var rn = req.RailroadNotification;
            var notification = new RailroadNotification
            {
                Id = Guid.NewGuid(),
                IncidentId = incident.Id,
                RailroadId = incident.RailroadId.Value,
                WasNotified = rn.WasNotified,
                NotificationDateTime = rn.NotificationDateTime,
                PersonNotified = rn.PersonNotified,
                PersonTitle = rn.PersonTitle,
                Notes = rn.Notes,
                Deadline = _dateTime.UtcNow.AddHours(24), // Default; recalculated by background job
                CreatedAt = _dateTime.UtcNow,
                UpdatedAt = _dateTime.UtcNow,
            };

            if (Enum.TryParse<NotificationMethod>(rn.Method?.Replace("-", ""), ignoreCase: true, out var method))
                notification.Method = method;

            _db.RailroadNotifications.Add(notification);
        }

        await _db.SaveChangesAsync(cancellationToken);

        return await MapToDetailResponse(incident, cancellationToken);
    }

    private async Task<string> GenerateIncidentNumberAsync(CancellationToken cancellationToken)
    {
        var year = _dateTime.UtcNow.Year;
        var yearStart = new DateTimeOffset(year, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var yearEnd = yearStart.AddYears(1);

        // Use max incident number for the year to avoid race conditions.
        // The unique index on IncidentNumber provides a safety net for concurrent inserts.
        var maxNumber = await _db.Incidents
            .IgnoreQueryFilters()
            .Where(i => i.CreatedAt >= yearStart && i.CreatedAt < yearEnd)
            .CountAsync(cancellationToken);

        return $"INC-{year}-{(maxNumber + 1):D3}";
    }

    private async Task<IncidentDetailResponse> MapToDetailResponse(Incident incident, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FindAsync([incident.ReportedById], cancellationToken);

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
            ProjectId = incident.ProjectId,
            RailroadId = incident.RailroadId,
            IsOshaRecordable = incident.IsOshaRecordable,
            IsDart = incident.IsDart,
            OshaOverrideJustification = incident.OshaOverrideJustification,
            ReopenCount = incident.ReopenCount,
            ReportedBy = user?.DisplayName ?? "Unknown",
            ReportedById = incident.ReportedById,
            CreatedAt = incident.CreatedAt,
            UpdatedAt = incident.UpdatedAt,
            Photos = [],
            InjuredPersons = [],
        };
    }
}

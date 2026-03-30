using Lyon.Domain.DomainEvents;
using Lyon.Domain.Enums;
using Lyon.Domain.Exceptions;
using Lyon.Domain.Interfaces;

namespace Lyon.Domain.Entities;

public class Incident : AggregateRoot, ISoftDeletable
{
    public string IncidentNumber { get; set; } = string.Empty;
    public IncidentType IncidentType { get; set; }
    public DateTimeOffset DateTime { get; set; }
    public string TimezoneId { get; set; } = "America/Chicago";
    public string Description { get; set; } = string.Empty;
    public Severity? Severity { get; set; }
    public Severity? PotentialSeverity { get; set; }
    public IncidentStatus Status { get; set; } = IncidentStatus.Draft;

    // Location
    public double? LocationLatitude { get; set; }
    public double? LocationLongitude { get; set; }
    public string LocationDescription { get; set; } = string.Empty;
    public string LocationGpsSource { get; set; } = "manual";

    // Details
    public string? ImmediateActions { get; set; }
    public Shift? Shift { get; set; }
    public TimeOnly? ShiftStart { get; set; }
    public TimeOnly? ShiftEnd { get; set; }
    public WeatherCondition? Weather { get; set; }
    public bool OnRailroadProperty { get; set; }

    // OSHA
    public bool? IsOshaRecordable { get; set; }
    public bool? IsDart { get; set; }
    public string? OshaOverrideJustification { get; set; }
    public Guid? OshaDeterminedById { get; set; }

    public int ReopenCount { get; set; }
    public bool IsDeleted { get; set; }

    // Foreign keys
    public Guid? DivisionId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid ReportedById { get; set; }
    public Guid? RailroadId { get; set; }

    // Navigation
    public Division? Division { get; set; }
    public Project? Project { get; set; }
    public User ReportedBy { get; set; } = null!;
    public User? OshaDeterminedBy { get; set; }
    public Railroad? Railroad { get; set; }
    public ICollection<InjuredPerson> InjuredPersons { get; set; } = [];
    public ICollection<IncidentPhoto> Photos { get; set; } = [];
    public ICollection<Investigation> Investigations { get; set; } = [];
    public ICollection<RailroadNotification> RailroadNotifications { get; set; } = [];
    public ICollection<CapaIncident> CapaIncidents { get; set; } = [];

    private static readonly Dictionary<IncidentStatus, IncidentStatus[]> ValidTransitions = new()
    {
        [IncidentStatus.Draft] = [IncidentStatus.Reported],
        [IncidentStatus.Reported] = [IncidentStatus.UnderInvestigation],
        [IncidentStatus.UnderInvestigation] = [IncidentStatus.InvestigationComplete],
        [IncidentStatus.InvestigationComplete] = [IncidentStatus.InvestigationApproved, IncidentStatus.UnderInvestigation],
        [IncidentStatus.InvestigationApproved] = [IncidentStatus.CapaAssigned],
        [IncidentStatus.CapaAssigned] = [IncidentStatus.CapaInProgress],
        [IncidentStatus.CapaInProgress] = [IncidentStatus.Closed],
        [IncidentStatus.Closed] = [IncidentStatus.Reopened],
        [IncidentStatus.Reopened] = [IncidentStatus.UnderInvestigation],
    };

    public void TransitionTo(IncidentStatus newStatus)
    {
        if (!ValidTransitions.TryGetValue(Status, out var allowed) || !allowed.Contains(newStatus))
            throw new InvalidStatusTransitionException(Status.ToString(), newStatus.ToString());

        var oldStatus = Status;
        Status = newStatus;

        if (newStatus == IncidentStatus.Reopened)
            ReopenCount++;

        RaiseDomainEvent(new IncidentStatusChangedEvent(Id, oldStatus, newStatus));
    }

    public void MarkAsReported()
    {
        if (Status == IncidentStatus.Draft)
        {
            Status = IncidentStatus.Reported;
            RaiseDomainEvent(new IncidentCreatedEvent(Id, ReportedById, DivisionId));
        }
    }
}

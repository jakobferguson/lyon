namespace Lyon.Contracts.Requests;

public record CreateIncidentRequest
{
    public required string IncidentType { get; init; }
    public required DateTimeOffset DateTime { get; init; }
    public required string Description { get; init; }
    public required string LocationDescription { get; init; }
    public double? LocationLatitude { get; init; }
    public double? LocationLongitude { get; init; }
    public string LocationGpsSource { get; init; } = "manual";
    public string? TimezoneId { get; init; }

    // Full report fields (optional for draft)
    public Guid? DivisionId { get; init; }
    public Guid? ProjectId { get; init; }
    public string? ImmediateActions { get; init; }
    public string? Severity { get; init; }
    public string? PotentialSeverity { get; init; }
    public string? Shift { get; init; }
    public string? ShiftStart { get; init; }
    public string? ShiftEnd { get; init; }
    public string? Weather { get; init; }
    public bool OnRailroadProperty { get; init; }
    public Guid? RailroadId { get; init; }
    public bool SubmitAsReported { get; init; }

    // OSHA
    public bool? IsOshaRecordable { get; init; }
    public bool? IsDart { get; init; }
    public string? OshaOverrideJustification { get; init; }

    // Sub-objects
    public IReadOnlyList<InjuredPersonRequest>? InjuredPersons { get; init; }
    public RailroadNotificationRequest? RailroadNotification { get; init; }
}

public record InjuredPersonRequest
{
    public required string Name { get; init; }
    public string? JobTitle { get; init; }
    public Guid? DivisionId { get; init; }
    public string? InjuryType { get; init; }
    public string? BodyPart { get; init; }
    public string? BodySide { get; init; }
    public string? TreatmentType { get; init; }
    public string? ReturnToWorkStatus { get; init; }
    public int? DaysAway { get; init; }
    public int? DaysRestricted { get; init; }
}

public record RailroadNotificationRequest
{
    public bool WasNotified { get; init; }
    public DateTimeOffset? NotificationDateTime { get; init; }
    public string? Method { get; init; }
    public string? PersonNotified { get; init; }
    public string? PersonTitle { get; init; }
    public string? Notes { get; init; }
}

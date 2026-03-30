namespace Lyon.Contracts.Requests;

public record UpdateIncidentRequest
{
    public string? IncidentType { get; init; }
    public DateTimeOffset? DateTime { get; init; }
    public string? Description { get; init; }
    public string? LocationDescription { get; init; }
    public double? LocationLatitude { get; init; }
    public double? LocationLongitude { get; init; }
    public string? LocationGpsSource { get; init; }
    public string? TimezoneId { get; init; }
    public Guid? DivisionId { get; init; }
    public Guid? ProjectId { get; init; }
    public string? ImmediateActions { get; init; }
    public string? Severity { get; init; }
    public string? PotentialSeverity { get; init; }
    public string? Shift { get; init; }
    public string? ShiftStart { get; init; }
    public string? ShiftEnd { get; init; }
    public string? Weather { get; init; }
    public bool? OnRailroadProperty { get; init; }
    public Guid? RailroadId { get; init; }
    public bool? IsOshaRecordable { get; init; }
    public bool? IsDart { get; init; }
    public string? OshaOverrideJustification { get; init; }
    public IReadOnlyList<InjuredPersonRequest>? InjuredPersons { get; init; }
    public RailroadNotificationRequest? RailroadNotification { get; init; }
}

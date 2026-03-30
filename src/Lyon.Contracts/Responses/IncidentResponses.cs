namespace Lyon.Contracts.Responses;

public record IncidentListItemResponse
{
    public required Guid Id { get; init; }
    public required string IncidentNumber { get; init; }
    public required string IncidentType { get; init; }
    public required DateTimeOffset DateTime { get; init; }
    public string? Division { get; init; }
    public string? Project { get; init; }
    public string? Severity { get; init; }
    public required string Status { get; init; }
    public required string Description { get; init; }
    public required string ReportedBy { get; init; }
    public required LocationResponse Location { get; init; }
}

public record IncidentDetailResponse
{
    public required Guid Id { get; init; }
    public required string IncidentNumber { get; init; }
    public required string IncidentType { get; init; }
    public required DateTimeOffset DateTime { get; init; }
    public required string TimezoneId { get; init; }
    public required string Description { get; init; }
    public string? Severity { get; init; }
    public string? PotentialSeverity { get; init; }
    public required string Status { get; init; }
    public required LocationResponse Location { get; init; }
    public string? ImmediateActions { get; init; }
    public string? Shift { get; init; }
    public string? ShiftStart { get; init; }
    public string? ShiftEnd { get; init; }
    public string? Weather { get; init; }
    public bool OnRailroadProperty { get; init; }
    public Guid? DivisionId { get; init; }
    public string? Division { get; init; }
    public Guid? ProjectId { get; init; }
    public string? Project { get; init; }
    public Guid? RailroadId { get; init; }
    public string? Railroad { get; init; }
    public bool? IsOshaRecordable { get; init; }
    public bool? IsDart { get; init; }
    public string? OshaOverrideJustification { get; init; }
    public int ReopenCount { get; init; }
    public required string ReportedBy { get; init; }
    public required Guid ReportedById { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required DateTimeOffset UpdatedAt { get; init; }
    public int CompletionPercentage { get; init; }

    // Nested
    public IReadOnlyList<InjuredPersonResponse>? InjuredPersons { get; init; }
    public IReadOnlyList<IncidentPhotoResponse>? Photos { get; init; }
    public RailroadNotificationResponse? RailroadNotification { get; init; }
}

public record LocationResponse
{
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public required string TextDescription { get; init; }
    public required string GpsSource { get; init; }
}

public record InjuredPersonResponse
{
    public required Guid Id { get; init; }
    public string? Name { get; init; }
    public string? JobTitle { get; init; }
    public string? Division { get; init; }
    public string? InjuryType { get; init; }
    public string? BodyPart { get; init; }
    public string? BodySide { get; init; }
    public string? TreatmentType { get; init; }
    public string? ReturnToWorkStatus { get; init; }
    public int? DaysAway { get; init; }
    public int? DaysRestricted { get; init; }
}

public record IncidentPhotoResponse
{
    public required Guid Id { get; init; }
    public required string FileName { get; init; }
    public required string Url { get; init; }
    public required string ContentType { get; init; }
    public required long FileSizeBytes { get; init; }
    public required int SortOrder { get; init; }
}

public record RailroadNotificationResponse
{
    public required Guid Id { get; init; }
    public required string Railroad { get; init; }
    public required bool WasNotified { get; init; }
    public DateTimeOffset? NotificationDateTime { get; init; }
    public string? Method { get; init; }
    public string? PersonNotified { get; init; }
    public string? PersonTitle { get; init; }
    public string? Notes { get; init; }
    public required DateTimeOffset Deadline { get; init; }
    public required bool IsOverdue { get; init; }
}

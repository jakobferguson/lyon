namespace Lyon.Contracts.Responses;

public record FactorTypeResponse
{
    public required Guid Id { get; init; }
    public required string Category { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required bool IsActive { get; init; }
    public required int SortOrder { get; init; }
}

public record RailroadResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required bool IsActive { get; init; }
    public IReadOnlyList<RailroadNotificationRuleResponse>? NotificationRules { get; init; }
}

public record RailroadNotificationRuleResponse
{
    public required Guid Id { get; init; }
    public required string IncidentType { get; init; }
    public required int DeadlineMinutes { get; init; }
    public required bool IsWithinShift { get; init; }
}

public record PropertyZoneResponse
{
    public required Guid Id { get; init; }
    public required Guid RailroadId { get; init; }
    public required string RailroadName { get; init; }
    public required string Name { get; init; }
    public required double CenterLatitude { get; init; }
    public required double CenterLongitude { get; init; }
    public required double RadiusMeters { get; init; }
    public required bool IsActive { get; init; }
}

public record AuditLogEntryResponse
{
    public required long Id { get; init; }
    public required DateTimeOffset Timestamp { get; init; }
    public required string UserDisplayName { get; init; }
    public required string Action { get; init; }
    public required string EntityType { get; init; }
    public required Guid EntityId { get; init; }
    public string? FieldName { get; init; }
    public string? OldValue { get; init; }
    public string? NewValue { get; init; }
    public string? Justification { get; init; }
}

public record DivisionResponse
{
    public required Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public required bool IsActive { get; init; }
}

public record ProjectResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Code { get; init; }
    public required Guid DivisionId { get; init; }
    public required string Division { get; init; }
    public required bool IsActive { get; init; }
}

public record ShiftWindowResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string StartTime { get; init; }
    public required string EndTime { get; init; }
    public required bool IsActive { get; init; }
}

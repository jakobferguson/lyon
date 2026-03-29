namespace Lyon.Contracts.Requests;

public record UpsertHoursWorkedRequest
{
    public required int Year { get; init; }
    public required int Month { get; init; }
    public Guid? DivisionId { get; init; }
    public required decimal Hours { get; init; }
}

public record UpsertFactorTypeRequest
{
    public required string Category { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public int SortOrder { get; init; }
}

public record UpsertRailroadRequest
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public IReadOnlyList<RailroadNotificationRuleRequest>? NotificationRules { get; init; }
}

public record RailroadNotificationRuleRequest
{
    public required string IncidentType { get; init; }
    public required int DeadlineMinutes { get; init; }
    public bool IsWithinShift { get; init; }
}

public record UpsertPropertyZoneRequest
{
    public required Guid RailroadId { get; init; }
    public required string Name { get; init; }
    public required double CenterLatitude { get; init; }
    public required double CenterLongitude { get; init; }
    public required double RadiusMeters { get; init; }
}

public record UpsertShiftWindowRequest
{
    public required string Name { get; init; }
    public required string StartTime { get; init; }
    public required string EndTime { get; init; }
}

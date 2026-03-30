namespace Lyon.Contracts.Responses;

public record DashboardResponse
{
    public required DashboardKpiResponse Kpis { get; init; }
    public required IReadOnlyList<MonthlyTrendPoint> IncidentTrend { get; init; }
    public required IReadOnlyList<MonthlyTrendPoint> TrirTrend { get; init; }
    public required IReadOnlyList<DivisionBreakdownItem> DivisionBreakdown { get; init; }
    public required IReadOnlyList<SeverityDistributionItem> SeverityDistribution { get; init; }
    public required LeadingIndicatorsResponse LeadingIndicators { get; init; }
    public required IReadOnlyList<IncidentListItemResponse> RecentIncidents { get; init; }
}

public record DashboardKpiResponse
{
    public required decimal Trir { get; init; }
    public required decimal TrirTrend { get; init; }
    public required decimal DartRate { get; init; }
    public required decimal DartRateTrend { get; init; }
    public required decimal NearMissRatio { get; init; }
    public required decimal NearMissRatioTrend { get; init; }
    public required int OpenInvestigations { get; init; }
    public required int OpenCapas { get; init; }
    public required int LostWorkDaysYtd { get; init; }
}

public record MonthlyTrendPoint
{
    public required int Year { get; init; }
    public required int Month { get; init; }
    public required decimal Value { get; init; }
    public string? Category { get; init; }
}

public record DivisionBreakdownItem
{
    public required string Division { get; init; }
    public required string IncidentType { get; init; }
    public required int Count { get; init; }
}

public record SeverityDistributionItem
{
    public required string Severity { get; init; }
    public required int Count { get; init; }
}

public record LeadingIndicatorsResponse
{
    public required decimal NearMissReportingRate { get; init; }
    public required decimal NearMissTarget { get; init; }
    public required decimal CapaClosureRate { get; init; }
    public required decimal CapaClosureTarget { get; init; }
    public required decimal InvestigationTimeliness { get; init; }
    public required decimal InvestigationTimelinessTarget { get; init; }
}

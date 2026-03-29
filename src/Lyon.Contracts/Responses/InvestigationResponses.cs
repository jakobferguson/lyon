namespace Lyon.Contracts.Responses;

public record InvestigationListItemResponse
{
    public required Guid Id { get; init; }
    public required Guid IncidentId { get; init; }
    public required string IncidentNumber { get; init; }
    public required string Status { get; init; }
    public required string Severity { get; init; }
    public string? Division { get; init; }
    public string? Project { get; init; }
    public string? LeadInvestigator { get; init; }
    public required DateTimeOffset TargetCompletionDate { get; init; }
    public required int InvestigationNumber { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}

public record InvestigationDetailResponse
{
    public required Guid Id { get; init; }
    public required Guid IncidentId { get; init; }
    public required string LeadInvestigator { get; init; }
    public required Guid LeadInvestigatorId { get; init; }
    public required string AssignedBy { get; init; }
    public required DateTimeOffset TargetCompletionDate { get; init; }
    public DateTimeOffset? ActualCompletionDate { get; init; }
    public string? RootCauseSummary { get; init; }
    public required string Status { get; init; }
    public string? ReviewComments { get; init; }
    public string? ReviewedBy { get; init; }
    public DateTimeOffset? ReviewedAt { get; init; }
    public required int InvestigationNumber { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }

    public IReadOnlyList<TeamMemberResponse>? TeamMembers { get; init; }
    public IReadOnlyList<FiveWhyEntryResponse>? FiveWhyEntries { get; init; }
    public IReadOnlyList<ContributingFactorResponse>? ContributingFactors { get; init; }
    public IReadOnlyList<WitnessStatementResponse>? WitnessStatements { get; init; }
}

public record TeamMemberResponse
{
    public required Guid UserId { get; init; }
    public required string DisplayName { get; init; }
    public required string Email { get; init; }
}

public record FiveWhyEntryResponse
{
    public required Guid Id { get; init; }
    public required int Level { get; init; }
    public required string WhyQuestion { get; init; }
    public required string Answer { get; init; }
    public string? SupportingEvidence { get; init; }
}

public record ContributingFactorResponse
{
    public required Guid Id { get; init; }
    public required Guid FactorTypeId { get; init; }
    public required string FactorCategory { get; init; }
    public required string FactorName { get; init; }
    public required bool IsPrimary { get; init; }
    public string? Notes { get; init; }
}

public record WitnessStatementResponse
{
    public required Guid Id { get; init; }
    public required string WitnessName { get; init; }
    public string? JobTitle { get; init; }
    public string? Employer { get; init; }
    public string? Phone { get; init; }
    public required string StatementText { get; init; }
    public required DateOnly CollectionDate { get; init; }
    public required string CollectedBy { get; init; }
    public Guid? ReferencesStatementId { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}

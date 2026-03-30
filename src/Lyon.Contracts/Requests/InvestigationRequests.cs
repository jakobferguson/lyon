namespace Lyon.Contracts.Requests;

public record AssignInvestigationRequest
{
    public required Guid LeadInvestigatorId { get; init; }
    public IReadOnlyList<Guid>? TeamMemberIds { get; init; }
    public DateTimeOffset? TargetCompletionDate { get; init; }
}

public record SubmitFiveWhyRequest
{
    public required IReadOnlyList<FiveWhyEntryRequest> Entries { get; init; }
    public string? RootCauseSummary { get; init; }
}

public record FiveWhyEntryRequest
{
    public required int Level { get; init; }
    public required string WhyQuestion { get; init; }
    public required string Answer { get; init; }
    public string? SupportingEvidence { get; init; }
}

public record AddContributingFactorRequest
{
    public required Guid FactorTypeId { get; init; }
    public bool IsPrimary { get; init; }
    public string? Notes { get; init; }
}

public record AddWitnessStatementRequest
{
    public required string WitnessName { get; init; }
    public string? JobTitle { get; init; }
    public string? Employer { get; init; }
    public string? Phone { get; init; }
    public required string StatementText { get; init; }
    public required DateOnly CollectionDate { get; init; }
    public Guid? ReferencesStatementId { get; init; }
}

public record ReviewInvestigationRequest
{
    public required string Action { get; init; }  // "approve" or "return"
    public string? Comments { get; init; }
}

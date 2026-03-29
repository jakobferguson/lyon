namespace Lyon.Contracts.Responses;

public record CapaListItemResponse
{
    public required Guid Id { get; init; }
    public required string CapaNumber { get; init; }
    public required string Type { get; init; }
    public required string Category { get; init; }
    public required string Description { get; init; }
    public required string AssignedTo { get; init; }
    public required string Priority { get; init; }
    public required string Status { get; init; }
    public required DateTimeOffset DueDate { get; init; }
    public DateTimeOffset? VerificationDueDate { get; init; }
    public required int LinkedIncidentCount { get; init; }
}

public record CapaDetailResponse
{
    public required Guid Id { get; init; }
    public required string CapaNumber { get; init; }
    public required string Type { get; init; }
    public required string Category { get; init; }
    public required string Description { get; init; }
    public required Guid AssignedToId { get; init; }
    public required string AssignedTo { get; init; }
    public Guid? VerifiedById { get; init; }
    public string? VerifiedBy { get; init; }
    public required string Priority { get; init; }
    public required string Status { get; init; }
    public required DateTimeOffset DueDate { get; init; }
    public DateTimeOffset? VerificationDueDate { get; init; }
    public string? VerificationMethod { get; init; }
    public string? CompletionNotes { get; init; }
    public string? VerificationNotes { get; init; }
    public DateTimeOffset? CompletedAt { get; init; }
    public DateTimeOffset? VerifiedAt { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public IReadOnlyList<LinkedIncidentResponse>? LinkedIncidents { get; init; }
}

public record LinkedIncidentResponse
{
    public required Guid Id { get; init; }
    public required string IncidentNumber { get; init; }
    public required string IncidentType { get; init; }
    public required string Status { get; init; }
}

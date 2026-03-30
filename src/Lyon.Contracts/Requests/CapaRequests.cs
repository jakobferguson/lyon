namespace Lyon.Contracts.Requests;

public record CreateCapaRequest
{
    public required string Type { get; init; }
    public required string Category { get; init; }
    public required string Description { get; init; }
    public required Guid AssignedToId { get; init; }
    public required string Priority { get; init; }
    public string? VerificationMethod { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public required IReadOnlyList<Guid> LinkedIncidentIds { get; init; }
}

public record TransitionCapaRequest
{
    public required string NewStatus { get; init; }
    public string? CompletionNotes { get; init; }
    public string? VerificationNotes { get; init; }
    public Guid? VerifiedById { get; init; }
}

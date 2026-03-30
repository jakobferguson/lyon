namespace Lyon.Contracts.Requests;

public record CreateRecurrenceLinkRequest
{
    public required Guid IncidentAId { get; init; }
    public required Guid IncidentBId { get; init; }
    public required IReadOnlyList<string> SimilarityTypes { get; init; }
    public string? Notes { get; init; }
}

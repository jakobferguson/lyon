namespace Lyon.Contracts.Requests;

public record TransitionStatusRequest
{
    public required string NewStatus { get; init; }
    public string? Reason { get; init; }
}

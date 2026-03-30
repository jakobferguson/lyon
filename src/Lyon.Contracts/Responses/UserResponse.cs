namespace Lyon.Contracts.Responses;

public record UserResponse
{
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public required string Role { get; init; }
    public string? Division { get; init; }
    public Guid? DivisionId { get; init; }
}

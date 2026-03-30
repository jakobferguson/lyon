namespace Lyon.Contracts.Responses;

public record NotificationResponse
{
    public required Guid Id { get; init; }
    public required string Type { get; init; }
    public required string Title { get; init; }
    public required string Summary { get; init; }
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public required bool IsRead { get; init; }
    public required bool IsPersistentBanner { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}

public record NotificationCountResponse
{
    public required int UnreadCount { get; init; }
    public required int BannerCount { get; init; }
}

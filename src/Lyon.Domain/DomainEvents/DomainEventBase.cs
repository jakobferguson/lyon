namespace Lyon.Domain.DomainEvents;

public abstract record DomainEventBase : IDomainEvent
{
    public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
}

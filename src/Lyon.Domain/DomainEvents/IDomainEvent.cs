namespace Lyon.Domain.DomainEvents;

public interface IDomainEvent
{
    DateTimeOffset OccurredAt { get; }
}

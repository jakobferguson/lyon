namespace Lyon.Domain.DomainEvents;

public sealed record CapaOverdueEvent(Guid CapaId, Guid AssignedToId, int DaysOverdue) : DomainEventBase;

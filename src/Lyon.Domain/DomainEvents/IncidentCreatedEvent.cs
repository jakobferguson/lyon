namespace Lyon.Domain.DomainEvents;

public sealed record IncidentCreatedEvent(Guid IncidentId, Guid ReportedById, Guid? DivisionId) : DomainEventBase;

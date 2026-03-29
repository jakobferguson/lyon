namespace Lyon.Domain.DomainEvents;

public sealed record InvestigationApprovedEvent(
    Guid InvestigationId,
    Guid IncidentId,
    Guid ApprovedById) : DomainEventBase;

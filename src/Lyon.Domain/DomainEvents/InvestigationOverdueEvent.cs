namespace Lyon.Domain.DomainEvents;

public sealed record InvestigationOverdueEvent(
    Guid InvestigationId,
    Guid LeadInvestigatorId,
    int DaysOverdue) : DomainEventBase;

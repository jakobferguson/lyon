using Lyon.Domain.Enums;

namespace Lyon.Domain.DomainEvents;

public sealed record IncidentStatusChangedEvent(
    Guid IncidentId,
    IncidentStatus OldStatus,
    IncidentStatus NewStatus) : DomainEventBase;

using Lyon.Domain.Enums;

namespace Lyon.Domain.DomainEvents;

public sealed record CapaStatusChangedEvent(
    Guid CapaId,
    CapaStatus OldStatus,
    CapaStatus NewStatus) : DomainEventBase;

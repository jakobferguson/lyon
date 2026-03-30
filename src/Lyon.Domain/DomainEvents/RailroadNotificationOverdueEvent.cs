namespace Lyon.Domain.DomainEvents;

public sealed record RailroadNotificationOverdueEvent(
    Guid RailroadNotificationId,
    Guid IncidentId,
    Guid RailroadId) : DomainEventBase;

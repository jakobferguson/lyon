using Lyon.Application.Common.Interfaces;
using Lyon.Domain.DomainEvents;
using Lyon.Domain.Enums;
using MediatR;

namespace Lyon.Application.Features.Incidents.EventHandlers;

public class IncidentCreatedHandler : INotificationHandler<DomainEventNotification<IncidentCreatedEvent>>
{
    private readonly INotificationService _notifications;

    public IncidentCreatedHandler(INotificationService notifications)
    {
        _notifications = notifications;
    }

    public async Task Handle(DomainEventNotification<IncidentCreatedEvent> notification, CancellationToken cancellationToken)
    {
        var evt = notification.DomainEvent;
        await _notifications.SendToRoleAsync(
            UserRole.SafetyManager,
            evt.DivisionId,
            NotificationType.NewIncident,
            "New Incident Reported",
            $"A new incident has been reported.",
            "Incident",
            evt.IncidentId,
            cancellationToken: cancellationToken);
    }
}

/// <summary>
/// Wraps domain events as MediatR notifications.
/// </summary>
public record DomainEventNotification<T>(T DomainEvent) : INotification where T : IDomainEvent;

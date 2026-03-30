using Lyon.Domain.Enums;

namespace Lyon.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendAsync(
        Guid recipientId,
        NotificationType type,
        string title,
        string summary,
        string? entityType = null,
        Guid? entityId = null,
        bool isPersistentBanner = false,
        CancellationToken cancellationToken = default);

    Task SendToRoleAsync(
        UserRole role,
        Guid? divisionId,
        NotificationType type,
        string title,
        string summary,
        string? entityType = null,
        Guid? entityId = null,
        bool isPersistentBanner = false,
        CancellationToken cancellationToken = default);
}

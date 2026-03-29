using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Lyon.Infrastructure.Notifications;

public class InAppNotificationService : INotificationService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public InAppNotificationService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task SendAsync(
        Guid recipientId, NotificationType type, string title, string summary,
        string? entityType = null, Guid? entityId = null,
        bool isPersistentBanner = false, CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            Type = type,
            Title = title,
            Summary = summary,
            EntityType = entityType,
            EntityId = entityId,
            IsPersistentBanner = isPersistentBanner,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(90),
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task SendToRoleAsync(
        UserRole role, Guid? divisionId, NotificationType type, string title, string summary,
        string? entityType = null, Guid? entityId = null,
        bool isPersistentBanner = false, CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var recipients = await db.Users
            .Where(u => u.Role == role && u.IsActive)
            .Where(u => !divisionId.HasValue || u.DivisionId == divisionId)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        foreach (var recipientId in recipients)
        {
            db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = recipientId,
                Type = type,
                Title = title,
                Summary = summary,
                EntityType = entityType,
                EntityId = entityId,
                IsPersistentBanner = isPersistentBanner,
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(90),
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}

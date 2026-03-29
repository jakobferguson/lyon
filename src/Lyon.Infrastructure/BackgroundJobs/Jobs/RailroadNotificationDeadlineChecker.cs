using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lyon.Infrastructure.BackgroundJobs.Jobs;

public class RailroadNotificationDeadlineChecker
{
    private readonly IApplicationDbContext _db;
    private readonly INotificationService _notifications;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<RailroadNotificationDeadlineChecker> _logger;

    public RailroadNotificationDeadlineChecker(
        IApplicationDbContext db,
        INotificationService notifications,
        IDateTimeProvider dateTime,
        ILogger<RailroadNotificationDeadlineChecker> logger)
    {
        _db = db;
        _notifications = notifications;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        var now = _dateTime.UtcNow;

        var overdueNotifications = await _db.RailroadNotifications
            .Include(rn => rn.Incident)
            .Include(rn => rn.Railroad)
            .Where(rn => !rn.WasNotified && rn.Deadline < now && !rn.IsOverdue)
            .ToListAsync(cancellationToken);

        foreach (var rn in overdueNotifications)
        {
            rn.IsOverdue = true;

            await _notifications.SendToRoleAsync(
                UserRole.SafetyCoordinator,
                rn.Incident.DivisionId,
                NotificationType.RailroadNotificationOverdue,
                $"Railroad Notification Overdue: {rn.Railroad.Name}",
                $"Railroad notification for {rn.Incident.IncidentNumber} to {rn.Railroad.Name} is past deadline.",
                "RailroadNotification", rn.Id,
                isPersistentBanner: true,
                cancellationToken: cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Checked railroad notification deadlines; {Count} newly overdue", overdueNotifications.Count);
    }
}

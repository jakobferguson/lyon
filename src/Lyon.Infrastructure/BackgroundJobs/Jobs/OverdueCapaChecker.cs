using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lyon.Infrastructure.BackgroundJobs.Jobs;

public class OverdueCapaChecker
{
    private readonly IApplicationDbContext _db;
    private readonly INotificationService _notifications;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<OverdueCapaChecker> _logger;

    public OverdueCapaChecker(
        IApplicationDbContext db,
        INotificationService notifications,
        IDateTimeProvider dateTime,
        ILogger<OverdueCapaChecker> logger)
    {
        _db = db;
        _notifications = notifications;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        var now = _dateTime.UtcNow;

        // Check action due dates
        var overdueCapas = await _db.Capas
            .Where(c => !c.IsDeleted
                && c.Status == CapaStatus.Open || c.Status == CapaStatus.InProgress)
            .Where(c => c.DueDate < now)
            .ToListAsync(cancellationToken);

        foreach (var capa in overdueCapas)
        {
            await _notifications.SendAsync(
                capa.AssignedToId,
                NotificationType.CapaOverdue,
                "CAPA Overdue",
                $"CAPA {capa.CapaNumber} is past its due date.",
                "Capa", capa.Id,
                cancellationToken: cancellationToken);
        }

        // Check verification due dates
        var overdueVerifications = await _db.Capas
            .Where(c => !c.IsDeleted && c.Status == CapaStatus.VerificationPending)
            .Where(c => c.VerificationDueDate.HasValue && c.VerificationDueDate < now)
            .ToListAsync(cancellationToken);

        foreach (var capa in overdueVerifications)
        {
            await _notifications.SendToRoleAsync(
                UserRole.SafetyManager, null,
                NotificationType.CapaVerificationDue,
                "CAPA Verification Overdue",
                $"CAPA {capa.CapaNumber} verification is overdue.",
                "Capa", capa.Id,
                cancellationToken: cancellationToken);
        }

        _logger.LogInformation("Checked {ActionCount} overdue CAPAs and {VerifyCount} overdue verifications",
            overdueCapas.Count, overdueVerifications.Count);
    }
}

using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Constants;
using Lyon.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lyon.Infrastructure.BackgroundJobs.Jobs;

public class OverdueInvestigationChecker
{
    private readonly IApplicationDbContext _db;
    private readonly INotificationService _notifications;
    private readonly IDateTimeProvider _dateTime;
    private readonly ILogger<OverdueInvestigationChecker> _logger;

    public OverdueInvestigationChecker(
        IApplicationDbContext db,
        INotificationService notifications,
        IDateTimeProvider dateTime,
        ILogger<OverdueInvestigationChecker> logger)
    {
        _db = db;
        _notifications = notifications;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        var now = _dateTime.UtcNow;

        var overdueInvestigations = await _db.Investigations
            .Include(i => i.Incident)
            .Where(i => !i.IsDeleted
                && i.Status != InvestigationStatus.Approved
                && i.TargetCompletionDate < now)
            .ToListAsync(cancellationToken);

        foreach (var investigation in overdueInvestigations)
        {
            var daysOverdue = (int)(now - investigation.TargetCompletionDate).TotalDays;

            if (daysOverdue >= EscalationTiers.Tier3Days)
            {
                await _notifications.SendToRoleAsync(
                    UserRole.Executive, null,
                    NotificationType.InvestigationOverdue14Days,
                    "Critical: Investigation 14+ Days Overdue",
                    $"Investigation for {investigation.Incident.IncidentNumber} is {daysOverdue} days overdue.",
                    "Investigation", investigation.Id,
                    isPersistentBanner: true,
                    cancellationToken: cancellationToken);
            }
            else if (daysOverdue >= EscalationTiers.Tier2Days)
            {
                await _notifications.SendToRoleAsync(
                    UserRole.DivisionManager, investigation.Incident.DivisionId,
                    NotificationType.InvestigationOverdue7Days,
                    "Investigation 7+ Days Overdue",
                    $"Investigation for {investigation.Incident.IncidentNumber} is {daysOverdue} days overdue.",
                    "Investigation", investigation.Id,
                    cancellationToken: cancellationToken);
            }
            else if (daysOverdue >= EscalationTiers.Tier1Days)
            {
                await _notifications.SendAsync(
                    investigation.LeadInvestigatorId,
                    NotificationType.InvestigationOverdue3Days,
                    "Investigation Overdue",
                    $"Your investigation for {investigation.Incident.IncidentNumber} is {daysOverdue} days overdue.",
                    "Investigation", investigation.Id,
                    cancellationToken: cancellationToken);
            }
        }

        _logger.LogInformation("Checked {Count} overdue investigations", overdueInvestigations.Count);
    }
}

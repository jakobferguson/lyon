using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Investigations.Commands;

[Authorize(UserRole.SafetyManager)]
public record ReviewInvestigationCommand(Guid InvestigationId, string Action, string? Comments) : IRequest<Unit>;

public class ReviewInvestigationCommandHandler : IRequestHandler<ReviewInvestigationCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;

    public ReviewInvestigationCommandHandler(
        IApplicationDbContext db, ICurrentUserService currentUser, INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
    }

    public async Task<Unit> Handle(ReviewInvestigationCommand cmd, CancellationToken ct)
    {
        var investigation = await _db.Investigations
            .Include(i => i.Incident)
            .FirstOrDefaultAsync(i => i.Id == cmd.InvestigationId && !i.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Investigation {cmd.InvestigationId} not found.");

        if (cmd.Action.Equals("approve", StringComparison.OrdinalIgnoreCase))
        {
            investigation.Approve(_currentUser.UserId);
            investigation.Incident.TransitionTo(IncidentStatus.InvestigationApproved);

            await _notifications.SendAsync(
                investigation.LeadInvestigatorId,
                NotificationType.InvestigationApproved,
                "Investigation Approved",
                $"Your investigation for {investigation.Incident.IncidentNumber} has been approved.",
                "Investigation", investigation.Id, cancellationToken: ct);
        }
        else
        {
            investigation.Return(_currentUser.UserId, cmd.Comments ?? "");
            investigation.Incident.TransitionTo(IncidentStatus.UnderInvestigation);

            await _notifications.SendAsync(
                investigation.LeadInvestigatorId,
                NotificationType.InvestigationReturned,
                "Investigation Returned",
                $"Your investigation for {investigation.Incident.IncidentNumber} has been returned for further work.",
                "Investigation", investigation.Id, cancellationToken: ct);
        }

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}

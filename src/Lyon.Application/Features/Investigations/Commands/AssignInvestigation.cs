using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Investigations.Commands;

[Authorize(UserRole.SafetyManager)]
public record AssignInvestigationCommand(
    Guid IncidentId,
    Guid LeadInvestigatorId,
    IReadOnlyList<Guid>? TeamMemberIds,
    DateTimeOffset? TargetCompletionDate) : IRequest<InvestigationDetailResponse>;

public class AssignInvestigationCommandHandler : IRequestHandler<AssignInvestigationCommand, InvestigationDetailResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;
    private readonly IDateTimeProvider _dateTime;

    public AssignInvestigationCommandHandler(
        IApplicationDbContext db, ICurrentUserService currentUser,
        INotificationService notifications, IDateTimeProvider dateTime)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
        _dateTime = dateTime;
    }

    public async Task<InvestigationDetailResponse> Handle(AssignInvestigationCommand cmd, CancellationToken ct)
    {
        var incident = await _db.Incidents
            .FirstOrDefaultAsync(i => i.Id == cmd.IncidentId && !i.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Incident {cmd.IncidentId} not found.");

        var reopenCount = incident.ReopenCount;
        var targetDate = cmd.TargetCompletionDate
            ?? Investigation.CalculateTargetDate(incident.Severity, incident.DateTime);

        var investigation = new Investigation
        {
            Id = Guid.NewGuid(),
            IncidentId = cmd.IncidentId,
            LeadInvestigatorId = cmd.LeadInvestigatorId,
            AssignedById = _currentUser.UserId,
            TargetCompletionDate = targetDate,
            InvestigationNumber = reopenCount + 1,
            Status = InvestigationStatus.Open,
            CreatedAt = _dateTime.UtcNow,
            UpdatedAt = _dateTime.UtcNow,
        };

        _db.Investigations.Add(investigation);

        if (cmd.TeamMemberIds is { Count: > 0 })
        {
            foreach (var memberId in cmd.TeamMemberIds)
            {
                _db.InvestigationTeamMembers.Add(new InvestigationTeamMember
                {
                    InvestigationId = investigation.Id,
                    UserId = memberId,
                    AddedAt = _dateTime.UtcNow,
                });
            }
        }

        incident.TransitionTo(IncidentStatus.UnderInvestigation);
        await _db.SaveChangesAsync(ct);

        await _notifications.SendAsync(
            cmd.LeadInvestigatorId,
            NotificationType.InvestigationAssigned,
            "Investigation Assigned",
            $"You have been assigned as lead investigator for {incident.IncidentNumber}.",
            "Investigation", investigation.Id, cancellationToken: ct);

        var lead = await _db.Users.FindAsync([cmd.LeadInvestigatorId], ct);

        return new InvestigationDetailResponse
        {
            Id = investigation.Id,
            IncidentId = investigation.IncidentId,
            LeadInvestigator = lead?.DisplayName ?? "Unknown",
            LeadInvestigatorId = investigation.LeadInvestigatorId,
            AssignedBy = _currentUser.DisplayName,
            TargetCompletionDate = investigation.TargetCompletionDate,
            Status = investigation.Status.ToString(),
            InvestigationNumber = investigation.InvestigationNumber,
            CreatedAt = investigation.CreatedAt,
        };
    }
}

using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Incidents.Commands;

[Authorize(UserRole.SafetyCoordinator)]
public record TransitionIncidentStatusCommand(Guid IncidentId, string NewStatus, string? Reason) : IRequest<Unit>;

public class TransitionIncidentStatusCommandHandler : IRequestHandler<TransitionIncidentStatusCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly IAuditLogService _audit;

    public TransitionIncidentStatusCommandHandler(IApplicationDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<Unit> Handle(TransitionIncidentStatusCommand command, CancellationToken cancellationToken)
    {
        var incident = await _db.Incidents
            .FirstOrDefaultAsync(i => i.Id == command.IncidentId && !i.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Incident {command.IncidentId} not found.");

        var newStatus = Enum.Parse<IncidentStatus>(command.NewStatus.Replace(" ", ""), ignoreCase: true);
        var oldStatus = incident.Status;

        incident.TransitionTo(newStatus);

        await _audit.LogAsync(
            AuditAction.StatusChange,
            "Incident",
            incident.Id,
            "Status",
            oldStatus.ToString(),
            newStatus.ToString(),
            command.Reason,
            cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}

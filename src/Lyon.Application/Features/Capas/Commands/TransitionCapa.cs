using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Capas.Commands;

[Authorize(UserRole.SafetyCoordinator)]
public record TransitionCapaCommand(Guid CapaId, string NewStatus, string? Notes, Guid? VerifiedById) : IRequest<Unit>;

public class TransitionCapaCommandHandler : IRequestHandler<TransitionCapaCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public TransitionCapaCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<Unit> Handle(TransitionCapaCommand cmd, CancellationToken ct)
    {
        var capa = await _db.Capas
            .FirstOrDefaultAsync(c => c.Id == cmd.CapaId && !c.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"CAPA {cmd.CapaId} not found.");

        var newStatus = Enum.Parse<CapaStatus>(cmd.NewStatus.Replace(" ", ""), ignoreCase: true);
        var oldStatus = capa.Status;

        if (newStatus == CapaStatus.Completed)
            capa.CompletionNotes = cmd.Notes;

        if (newStatus is CapaStatus.VerifiedEffective or CapaStatus.VerifiedIneffective)
        {
            var verifierId = cmd.VerifiedById ?? _currentUser.UserId;
            if (!capa.CanBeVerifiedBy(verifierId))
                throw new InvalidOperationException("Verifier must be a different user from the assignee.");

            capa.VerifiedById = verifierId;
            capa.VerificationNotes = cmd.Notes;
        }

        capa.TransitionTo(newStatus);

        await _audit.LogAsync(
            AuditAction.StatusChange, "Capa", capa.Id,
            "Status", oldStatus.ToString(), capa.Status.ToString(),
            cancellationToken: ct);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}

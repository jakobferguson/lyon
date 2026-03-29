using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Investigations.Commands;

[Authorize(UserRole.SafetyCoordinator)]
public record AddContributingFactorCommand(
    Guid InvestigationId, Guid FactorTypeId, bool IsPrimary, string? Notes) : IRequest<Guid>;

public class AddContributingFactorCommandHandler : IRequestHandler<AddContributingFactorCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _dateTime;

    public AddContributingFactorCommandHandler(IApplicationDbContext db, IDateTimeProvider dateTime)
    {
        _db = db;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(AddContributingFactorCommand cmd, CancellationToken ct)
    {
        _ = await _db.Investigations.FirstOrDefaultAsync(i => i.Id == cmd.InvestigationId && !i.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Investigation {cmd.InvestigationId} not found.");

        if (cmd.IsPrimary)
        {
            var existingPrimary = await _db.ContributingFactors
                .Where(f => f.InvestigationId == cmd.InvestigationId && f.IsPrimary)
                .ToListAsync(ct);
            foreach (var f in existingPrimary) f.IsPrimary = false;
        }

        var factor = new ContributingFactor
        {
            Id = Guid.NewGuid(),
            InvestigationId = cmd.InvestigationId,
            FactorTypeId = cmd.FactorTypeId,
            IsPrimary = cmd.IsPrimary,
            Notes = cmd.Notes,
            CreatedAt = _dateTime.UtcNow,
        };

        _db.ContributingFactors.Add(factor);
        await _db.SaveChangesAsync(ct);
        return factor.Id;
    }
}

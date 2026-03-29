using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Recurrence.Commands;

[Authorize(UserRole.SafetyCoordinator)]
public record LinkIncidentsCommand(Guid IncidentAId, Guid IncidentBId, IReadOnlyList<string> SimilarityTypes, string? Notes) : IRequest<Guid>;

public class LinkIncidentsCommandHandler : IRequestHandler<LinkIncidentsCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public LinkIncidentsCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IDateTimeProvider dateTime)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(LinkIncidentsCommand cmd, CancellationToken ct)
    {
        // Normalize: always store smaller GUID first
        var (aId, bId) = cmd.IncidentAId.CompareTo(cmd.IncidentBId) <= 0
            ? (cmd.IncidentAId, cmd.IncidentBId)
            : (cmd.IncidentBId, cmd.IncidentAId);

        var exists = await _db.RecurrenceLinks
            .AnyAsync(r => r.IncidentAId == aId && r.IncidentBId == bId && !r.IsDeleted, ct);

        if (exists)
            throw new InvalidOperationException("These incidents are already linked.");

        var link = new RecurrenceLink
        {
            Id = Guid.NewGuid(),
            IncidentAId = aId,
            IncidentBId = bId,
            SimilarityTypes = string.Join(",", cmd.SimilarityTypes),
            Notes = cmd.Notes,
            LinkedById = _currentUser.UserId,
            CreatedAt = _dateTime.UtcNow,
            UpdatedAt = _dateTime.UtcNow,
        };

        _db.RecurrenceLinks.Add(link);
        await _db.SaveChangesAsync(ct);
        return link.Id;
    }
}

[Authorize(UserRole.SafetyCoordinator)]
public record UnlinkIncidentsCommand(Guid LinkId) : IRequest<Unit>;

public class UnlinkIncidentsCommandHandler : IRequestHandler<UnlinkIncidentsCommand, Unit>
{
    private readonly IApplicationDbContext _db;

    public UnlinkIncidentsCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<Unit> Handle(UnlinkIncidentsCommand cmd, CancellationToken ct)
    {
        var link = await _db.RecurrenceLinks.FindAsync([cmd.LinkId], ct)
            ?? throw new KeyNotFoundException($"Recurrence link {cmd.LinkId} not found.");

        link.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}

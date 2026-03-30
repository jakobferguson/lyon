using FluentValidation;
using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Requests;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Investigations.Commands;

[Authorize(UserRole.SafetyCoordinator)]
public record SubmitFiveWhyCommand(Guid InvestigationId, SubmitFiveWhyRequest Request) : IRequest<Unit>;

public class SubmitFiveWhyCommandValidator : AbstractValidator<SubmitFiveWhyCommand>
{
    public SubmitFiveWhyCommandValidator()
    {
        RuleFor(x => x.Request.Entries).NotEmpty().Must(e => e.Count >= 3)
            .WithMessage("Minimum 3 Why levels required.");
    }
}

public class SubmitFiveWhyCommandHandler : IRequestHandler<SubmitFiveWhyCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _dateTime;

    public SubmitFiveWhyCommandHandler(IApplicationDbContext db, IDateTimeProvider dateTime)
    {
        _db = db;
        _dateTime = dateTime;
    }

    public async Task<Unit> Handle(SubmitFiveWhyCommand cmd, CancellationToken ct)
    {
        var investigation = await _db.Investigations
            .FirstOrDefaultAsync(i => i.Id == cmd.InvestigationId && !i.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Investigation {cmd.InvestigationId} not found.");

        // Remove existing entries and replace
        var existing = await _db.FiveWhyEntries
            .Where(e => e.InvestigationId == cmd.InvestigationId)
            .ToListAsync(ct);

        _db.FiveWhyEntries.RemoveRange(existing);

        foreach (var entry in cmd.Request.Entries)
        {
            _db.FiveWhyEntries.Add(new FiveWhyEntry
            {
                Id = Guid.NewGuid(),
                InvestigationId = cmd.InvestigationId,
                Level = entry.Level,
                WhyQuestion = entry.WhyQuestion,
                Answer = entry.Answer,
                SupportingEvidence = entry.SupportingEvidence,
                CreatedAt = _dateTime.UtcNow,
                UpdatedAt = _dateTime.UtcNow,
            });
        }

        if (cmd.Request.RootCauseSummary is not null)
            investigation.RootCauseSummary = cmd.Request.RootCauseSummary;

        if (investigation.Status == InvestigationStatus.Open)
            investigation.Status = InvestigationStatus.InProgress;

        investigation.UpdatedAt = _dateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}

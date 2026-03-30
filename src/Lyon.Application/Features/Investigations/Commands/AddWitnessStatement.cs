using FluentValidation;
using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Investigations.Commands;

[Authorize(UserRole.SafetyCoordinator)]
public record AddWitnessStatementCommand(
    Guid InvestigationId,
    string WitnessName,
    string? JobTitle,
    string? Employer,
    string? Phone,
    string StatementText,
    DateOnly CollectionDate,
    Guid? ReferencesStatementId) : IRequest<Guid>;

public class AddWitnessStatementCommandValidator : AbstractValidator<AddWitnessStatementCommand>
{
    public AddWitnessStatementCommandValidator()
    {
        RuleFor(x => x.WitnessName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.StatementText).NotEmpty();
    }
}

public class AddWitnessStatementCommandHandler : IRequestHandler<AddWitnessStatementCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public AddWitnessStatementCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IDateTimeProvider dateTime)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(AddWitnessStatementCommand cmd, CancellationToken ct)
    {
        _ = await _db.Investigations.FirstOrDefaultAsync(i => i.Id == cmd.InvestigationId && !i.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Investigation {cmd.InvestigationId} not found.");

        var statement = new WitnessStatement
        {
            Id = Guid.NewGuid(),
            InvestigationId = cmd.InvestigationId,
            WitnessName = cmd.WitnessName,
            JobTitle = cmd.JobTitle,
            Employer = cmd.Employer,
            Phone = cmd.Phone,
            StatementText = cmd.StatementText,
            CollectionDate = cmd.CollectionDate,
            CollectedById = _currentUser.UserId,
            ReferencesStatementId = cmd.ReferencesStatementId,
            CreatedAt = _dateTime.UtcNow,
        };

        _db.WitnessStatements.Add(statement);
        await _db.SaveChangesAsync(ct);
        return statement.Id;
    }
}

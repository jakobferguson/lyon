using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Admin.Commands;

[Authorize(UserRole.SafetyManager)]
public record UpsertHoursWorkedCommand(int Year, int Month, Guid? DivisionId, decimal Hours) : IRequest<Unit>;

public class UpsertHoursWorkedCommandHandler : IRequestHandler<UpsertHoursWorkedCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public UpsertHoursWorkedCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IDateTimeProvider dateTime)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<Unit> Handle(UpsertHoursWorkedCommand cmd, CancellationToken ct)
    {
        var existing = await _db.HoursWorkedEntries
            .FirstOrDefaultAsync(h => h.Year == cmd.Year && h.Month == cmd.Month && h.DivisionId == cmd.DivisionId, ct);

        if (existing is not null)
        {
            existing.Hours = cmd.Hours;
            existing.EnteredById = _currentUser.UserId;
            existing.UpdatedAt = _dateTime.UtcNow;
        }
        else
        {
            _db.HoursWorkedEntries.Add(new HoursWorked
            {
                Id = Guid.NewGuid(),
                Year = cmd.Year,
                Month = cmd.Month,
                DivisionId = cmd.DivisionId,
                Hours = cmd.Hours,
                EnteredById = _currentUser.UserId,
                CreatedAt = _dateTime.UtcNow,
                UpdatedAt = _dateTime.UtcNow,
            });
        }

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}

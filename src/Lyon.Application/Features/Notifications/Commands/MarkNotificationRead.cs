using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Notifications.Commands;

[Authorize(UserRole.FieldReporter)]
public record MarkNotificationReadCommand(Guid NotificationId) : IRequest<Unit>;

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public MarkNotificationReadCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IDateTimeProvider dateTime)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<Unit> Handle(MarkNotificationReadCommand cmd, CancellationToken ct)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == cmd.NotificationId && n.RecipientId == _currentUser.UserId, ct);

        if (notification is not null)
        {
            notification.IsRead = true;
            notification.ReadAt = _dateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }

        return Unit.Value;
    }
}

[Authorize(UserRole.FieldReporter)]
public record MarkAllNotificationsReadCommand : IRequest<Unit>;

public class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public MarkAllNotificationsReadCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IDateTimeProvider dateTime)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<Unit> Handle(MarkAllNotificationsReadCommand cmd, CancellationToken ct)
    {
        var unread = await _db.Notifications
            .Where(n => n.RecipientId == _currentUser.UserId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = _dateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}

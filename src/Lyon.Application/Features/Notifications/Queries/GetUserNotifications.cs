using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Common;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Notifications.Queries;

[Authorize(UserRole.FieldReporter)]
public record GetUserNotificationsQuery(int PageNumber = 1, int PageSize = 20) : IRequest<PaginatedResponse<NotificationResponse>>;

public class GetUserNotificationsQueryHandler : IRequestHandler<GetUserNotificationsQuery, PaginatedResponse<NotificationResponse>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetUserNotificationsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PaginatedResponse<NotificationResponse>> Handle(GetUserNotificationsQuery query, CancellationToken ct)
    {
        var q = _db.Notifications
            .Where(n => n.RecipientId == _currentUser.UserId)
            .OrderByDescending(n => n.CreatedAt);

        var total = await q.CountAsync(ct);
        var items = await q
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(n => new NotificationResponse
            {
                Id = n.Id,
                Type = n.Type.ToString(),
                Title = n.Title,
                Summary = n.Summary,
                EntityType = n.EntityType,
                EntityId = n.EntityId,
                IsRead = n.IsRead,
                IsPersistentBanner = n.IsPersistentBanner,
                CreatedAt = n.CreatedAt,
            })
            .ToListAsync(ct);

        return new PaginatedResponse<NotificationResponse>(items, query.PageNumber, query.PageSize, total);
    }
}

[Authorize(UserRole.FieldReporter)]
public record GetNotificationCountQuery : IRequest<NotificationCountResponse>;

public class GetNotificationCountQueryHandler : IRequestHandler<GetNotificationCountQuery, NotificationCountResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationCountQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<NotificationCountResponse> Handle(GetNotificationCountQuery query, CancellationToken ct)
    {
        var unread = await _db.Notifications
            .CountAsync(n => n.RecipientId == _currentUser.UserId && !n.IsRead, ct);
        var banners = await _db.Notifications
            .CountAsync(n => n.RecipientId == _currentUser.UserId && n.IsPersistentBanner && !n.IsRead, ct);

        return new NotificationCountResponse { UnreadCount = unread, BannerCount = banners };
    }
}

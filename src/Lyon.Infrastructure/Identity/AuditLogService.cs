using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace Lyon.Infrastructure.Identity;

public class AuditLogService : IAuditLogService
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(IApplicationDbContext db, ICurrentUserService currentUser, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _currentUser = currentUser;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogAsync(
        AuditAction action, string entityType, Guid entityId,
        string? fieldName = null, string? oldValue = null, string? newValue = null,
        string? justification = null, CancellationToken cancellationToken = default)
    {
        var context = _httpContextAccessor.HttpContext;

        _db.AuditLogEntries.Add(new AuditLogEntry
        {
            Timestamp = DateTimeOffset.UtcNow,
            UserId = _currentUser.UserId,
            UserDisplayName = _currentUser.DisplayName,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            FieldName = fieldName,
            OldValue = oldValue,
            NewValue = newValue,
            Justification = justification,
            IpAddress = context?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = context?.Request.Headers.UserAgent.ToString(),
            CorrelationId = context?.TraceIdentifier,
        });

        await _db.SaveChangesAsync(cancellationToken);
    }
}

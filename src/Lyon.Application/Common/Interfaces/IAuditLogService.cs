using Lyon.Domain.Enums;

namespace Lyon.Application.Common.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        AuditAction action,
        string entityType,
        Guid entityId,
        string? fieldName = null,
        string? oldValue = null,
        string? newValue = null,
        string? justification = null,
        CancellationToken cancellationToken = default);
}

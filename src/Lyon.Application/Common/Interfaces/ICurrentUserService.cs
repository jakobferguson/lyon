using Lyon.Domain.Enums;

namespace Lyon.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string DisplayName { get; }
    string Email { get; }
    UserRole Role { get; }
    Guid? DivisionId { get; }
    bool IsAuthenticated { get; }
    bool HasMinimumRole(UserRole minimumRole);
    bool CanAccessMedicalData();
}

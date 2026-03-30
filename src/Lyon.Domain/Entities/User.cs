using Lyon.Domain.Enums;

namespace Lyon.Domain.Entities;

public class User : BaseEntity
{
    public string AzureAdObjectId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public Guid? DivisionId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? LastLoginAt { get; set; }

    // Navigation
    public Division? Division { get; set; }

    public bool HasMinimumRole(UserRole minimumRole) => Role >= minimumRole;

    public bool CanAccessMedicalData() =>
        Role is UserRole.SafetyCoordinator
            or UserRole.SafetyManager
            or UserRole.Admin;
}

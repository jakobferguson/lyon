using System.Security.Claims;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace Lyon.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public Guid UserId => Guid.TryParse(
        User?.FindFirstValue("oid") ?? User?.FindFirstValue("uid") ?? User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id
        : Guid.Empty;

    public string DisplayName => User?.FindFirstValue("name") ?? User?.FindFirstValue(ClaimTypes.Name) ?? string.Empty;

    public string Email => User?.FindFirstValue("email") ?? User?.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

    public UserRole Role => Enum.TryParse<UserRole>(
        User?.FindFirstValue("role") ?? User?.FindFirstValue(ClaimTypes.Role),
        ignoreCase: true, out var role) ? role : UserRole.FieldReporter;

    public Guid? DivisionId => Guid.TryParse(User?.FindFirstValue("division_id"), out var id) ? id : null;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public bool HasMinimumRole(UserRole minimumRole) => Role >= minimumRole;

    public bool CanAccessMedicalData() =>
        Role is UserRole.SafetyCoordinator or UserRole.SafetyManager or UserRole.Admin;
}

using Lyon.Domain.Enums;

namespace Lyon.Application.Common.Authorization;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
public class AuthorizeAttribute : Attribute
{
    public UserRole MinimumRole { get; }

    public AuthorizeAttribute(UserRole minimumRole = UserRole.FieldReporter)
    {
        MinimumRole = minimumRole;
    }
}

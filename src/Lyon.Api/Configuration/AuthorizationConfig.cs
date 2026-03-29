namespace Lyon.Api.Configuration;

public static class AuthorizationConfig
{
    public static IServiceCollection AddLyonAuthorization(this IServiceCollection services)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy("FieldReporter", p => p.RequireAuthenticatedUser())
            .AddPolicy("SafetyCoordinator", p => p.RequireRole("SafetyCoordinator", "SafetyManager", "DivisionSafetyOfficer", "RegionalManager", "DivisionManager", "VpSafety", "Admin"))
            .AddPolicy("SafetyManager", p => p.RequireRole("SafetyManager", "DivisionSafetyOfficer", "RegionalManager", "DivisionManager", "VpSafety", "Admin"))
            .AddPolicy("Admin", p => p.RequireRole("Admin"));

        return services;
    }
}

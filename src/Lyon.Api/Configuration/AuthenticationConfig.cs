using Microsoft.Identity.Web;

namespace Lyon.Api.Configuration;

public static class AuthenticationConfig
{
    public static IServiceCollection AddLyonAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMicrosoftIdentityWebApiAuthentication(configuration, "AzureAd");
        return services;
    }
}

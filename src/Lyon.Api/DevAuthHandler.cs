using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace Lyon.Api;

/// <summary>
/// Development-only authentication handler that creates a fake user
/// when SkipAuth=true. Never use in production.
/// </summary>
public class DevAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public DevAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Check for X-Dev-User-Id header for per-request user switching
        var userId = Request.Headers["X-Dev-User-Id"].FirstOrDefault()
            ?? "00000000-0000-0000-0000-000000000001";
        var role = Request.Headers["X-Dev-User-Role"].FirstOrDefault() ?? "Admin";
        var name = Request.Headers["X-Dev-User-Name"].FirstOrDefault() ?? "Dev Admin";

        var claims = new[]
        {
            new Claim("oid", userId),
            new Claim("sub", userId),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Email, "dev@herzog.com"),
            new Claim(ClaimTypes.Role, role),
            new Claim("name", name),
        };

        var identity = new ClaimsIdentity(claims, "DevAuth");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Bearer");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

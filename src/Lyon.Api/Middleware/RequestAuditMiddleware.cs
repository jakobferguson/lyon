namespace Lyon.Api.Middleware;

public class RequestAuditMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestAuditMiddleware> _logger;

    public RequestAuditMiddleware(RequestDelegate next, ILogger<RequestAuditMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var userId = context.User.Identity?.IsAuthenticated == true
            ? context.User.FindFirst("oid")?.Value ?? context.User.FindFirst("sub")?.Value ?? "unknown"
            : "anonymous";

        _logger.LogInformation(
            "API Request: {Method} {Path} by {UserId} from {IP}",
            context.Request.Method,
            context.Request.Path,
            userId,
            context.Connection.RemoteIpAddress);

        await _next(context);

        _logger.LogInformation(
            "API Response: {Method} {Path} -> {StatusCode}",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode);
    }
}

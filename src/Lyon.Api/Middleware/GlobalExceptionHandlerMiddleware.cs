using System.Text.Json;
using FluentValidation;
using Lyon.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Lyon.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Validation and domain exceptions have user-facing messages.
        // All other exceptions get generic messages to prevent information leakage.
        var (statusCode, title, detail) = exception switch
        {
            ValidationException ve => (StatusCodes.Status400BadRequest, "Validation Failed",
                string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Not Found", "The requested resource was not found."),
            InvalidStatusTransitionException ist => (StatusCodes.Status422UnprocessableEntity, "Invalid Status Transition", ist.Message),
            DomainException de => (StatusCodes.Status422UnprocessableEntity, "Domain Error", de.Message),
            InvalidOperationException => (StatusCodes.Status409Conflict, "Conflict", "A conflict occurred while processing your request."),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Forbidden", "You do not have permission to perform this action."),
            _ => (StatusCodes.Status500InternalServerError, "Internal Server Error", "An unexpected error occurred.")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception");
        else
            _logger.LogWarning(exception, "Handled exception: {Title}", title);

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path,
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problem, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }
}

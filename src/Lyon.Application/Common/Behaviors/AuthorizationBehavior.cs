using System.Reflection;
using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using MediatR;

namespace Lyon.Application.Common.Behaviors;

public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICurrentUserService _currentUserService;

    public AuthorizationBehavior(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var authorizeAttribute = request.GetType().GetCustomAttribute<AuthorizeAttribute>();

        if (authorizeAttribute is not null)
        {
            if (!_currentUserService.IsAuthenticated)
                throw new UnauthorizedAccessException("User is not authenticated.");

            if (!_currentUserService.HasMinimumRole(authorizeAttribute.MinimumRole))
                throw new UnauthorizedAccessException(
                    $"User does not have the required role. Minimum: {authorizeAttribute.MinimumRole}");
        }

        return await next();
    }
}

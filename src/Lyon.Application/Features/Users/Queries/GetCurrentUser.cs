using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Users.Queries;

public record GetCurrentUserQuery : IRequest<UserResponse>;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCurrentUserQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UserResponse> Handle(GetCurrentUserQuery query, CancellationToken ct)
    {
        var user = await _db.Users
            .Include(u => u.Division)
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, ct)
            ?? throw new KeyNotFoundException("Current user not found.");

        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString(),
            Division = user.Division?.Name,
            DivisionId = user.DivisionId,
        };
    }
}

public record GetUsersByRoleQuery(string Role) : IRequest<IReadOnlyList<UserResponse>>;

public class GetUsersByRoleQueryHandler : IRequestHandler<GetUsersByRoleQuery, IReadOnlyList<UserResponse>>
{
    private readonly IApplicationDbContext _db;

    public GetUsersByRoleQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<UserResponse>> Handle(GetUsersByRoleQuery query, CancellationToken ct)
    {
        var role = Enum.Parse<Lyon.Domain.Enums.UserRole>(query.Role.Replace("_", ""), ignoreCase: true);

        return await _db.Users
            .Include(u => u.Division)
            .Where(u => u.Role == role && u.IsActive)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                Email = u.Email,
                DisplayName = u.DisplayName,
                Role = u.Role.ToString(),
                Division = u.Division != null ? u.Division.Name : null,
                DivisionId = u.DivisionId,
            })
            .ToListAsync(ct);
    }
}

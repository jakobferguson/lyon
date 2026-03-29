using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Admin.Commands;

[Authorize(UserRole.SafetyManager)]
public record UpsertFactorTypeCommand(Guid? Id, string Category, string Name, string? Description, int SortOrder) : IRequest<FactorTypeResponse>;

public class UpsertFactorTypeCommandHandler : IRequestHandler<UpsertFactorTypeCommand, FactorTypeResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _dateTime;

    public UpsertFactorTypeCommandHandler(IApplicationDbContext db, IDateTimeProvider dateTime)
    {
        _db = db;
        _dateTime = dateTime;
    }

    public async Task<FactorTypeResponse> Handle(UpsertFactorTypeCommand cmd, CancellationToken ct)
    {
        FactorType factorType;

        if (cmd.Id.HasValue)
        {
            factorType = await _db.FactorTypes.FindAsync([cmd.Id.Value], ct)
                ?? throw new KeyNotFoundException($"Factor type {cmd.Id} not found.");

            factorType.Category = Enum.Parse<FactorCategory>(cmd.Category.Replace("/", "").Replace(" ", ""), ignoreCase: true);
            factorType.Name = cmd.Name;
            factorType.Description = cmd.Description;
            factorType.SortOrder = cmd.SortOrder;
            factorType.UpdatedAt = _dateTime.UtcNow;
        }
        else
        {
            factorType = new FactorType
            {
                Id = Guid.NewGuid(),
                Category = Enum.Parse<FactorCategory>(cmd.Category.Replace("/", "").Replace(" ", ""), ignoreCase: true),
                Name = cmd.Name,
                Description = cmd.Description,
                SortOrder = cmd.SortOrder,
                CreatedAt = _dateTime.UtcNow,
                UpdatedAt = _dateTime.UtcNow,
            };
            _db.FactorTypes.Add(factorType);
        }

        await _db.SaveChangesAsync(ct);

        return new FactorTypeResponse
        {
            Id = factorType.Id,
            Category = factorType.Category.ToString(),
            Name = factorType.Name,
            Description = factorType.Description,
            IsActive = factorType.IsActive,
            SortOrder = factorType.SortOrder,
        };
    }
}

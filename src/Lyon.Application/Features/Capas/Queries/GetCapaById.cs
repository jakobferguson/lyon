using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Capas.Queries;

[Authorize(UserRole.SafetyCoordinator)]
public record GetCapaByIdQuery(Guid CapaId) : IRequest<CapaDetailResponse?>;

public class GetCapaByIdQueryHandler : IRequestHandler<GetCapaByIdQuery, CapaDetailResponse?>
{
    private readonly IApplicationDbContext _db;

    public GetCapaByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<CapaDetailResponse?> Handle(GetCapaByIdQuery query, CancellationToken ct)
    {
        var capa = await _db.Capas
            .Include(c => c.AssignedTo)
            .Include(c => c.VerifiedBy)
            .Include(c => c.CapaIncidents).ThenInclude(ci => ci.Incident)
            .Where(c => c.Id == query.CapaId && !c.IsDeleted)
            .FirstOrDefaultAsync(ct);

        if (capa is null) return null;

        return new CapaDetailResponse
        {
            Id = capa.Id,
            CapaNumber = capa.CapaNumber,
            Type = capa.Type.ToString(),
            Category = capa.Category.ToString(),
            Description = capa.Description,
            AssignedToId = capa.AssignedToId,
            AssignedTo = capa.AssignedTo.DisplayName,
            VerifiedById = capa.VerifiedById,
            VerifiedBy = capa.VerifiedBy?.DisplayName,
            Priority = capa.Priority.ToString(),
            Status = capa.Status.ToString(),
            DueDate = capa.DueDate,
            VerificationDueDate = capa.VerificationDueDate,
            VerificationMethod = capa.VerificationMethod,
            CompletionNotes = capa.CompletionNotes,
            VerificationNotes = capa.VerificationNotes,
            CompletedAt = capa.CompletedAt,
            VerifiedAt = capa.VerifiedAt,
            CreatedAt = capa.CreatedAt,
            LinkedIncidents = capa.CapaIncidents.Select(ci => new LinkedIncidentResponse
            {
                Id = ci.Incident.Id,
                IncidentNumber = ci.Incident.IncidentNumber,
                IncidentType = ci.Incident.IncidentType.ToString(),
                Status = ci.Incident.Status.ToString(),
            }).ToList(),
        };
    }
}

using FluentValidation;
using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Requests;
using Lyon.Contracts.Responses;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Capas.Commands;

[Authorize(UserRole.SafetyCoordinator)]
public record CreateCapaCommand(CreateCapaRequest Request) : IRequest<CapaDetailResponse>;

public class CreateCapaCommandValidator : AbstractValidator<CreateCapaCommand>
{
    public CreateCapaCommandValidator()
    {
        RuleFor(x => x.Request.Description).NotEmpty();
        RuleFor(x => x.Request.AssignedToId).NotEmpty();
        RuleFor(x => x.Request.LinkedIncidentIds).NotEmpty()
            .WithMessage("At least one incident must be linked.");
    }
}

public class CreateCapaCommandHandler : IRequestHandler<CreateCapaCommand, CapaDetailResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _dateTime;
    private readonly INotificationService _notifications;

    public CreateCapaCommandHandler(IApplicationDbContext db, IDateTimeProvider dateTime, INotificationService notifications)
    {
        _db = db;
        _dateTime = dateTime;
        _notifications = notifications;
    }

    public async Task<CapaDetailResponse> Handle(CreateCapaCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        var priority = Enum.Parse<CapaPriority>(req.Priority, ignoreCase: true);

        var capaNumber = await GenerateCapaNumberAsync(ct);

        var capa = new Capa
        {
            Id = Guid.NewGuid(),
            CapaNumber = capaNumber,
            Type = Enum.Parse<CapaType>(req.Type, ignoreCase: true),
            Category = Enum.Parse<CapaCategory>(req.Category.Replace(" ", ""), ignoreCase: true),
            Description = req.Description,
            AssignedToId = req.AssignedToId,
            Priority = priority,
            DueDate = req.DueDate ?? Capa.CalculateActionDueDate(priority, _dateTime.UtcNow),
            VerificationMethod = req.VerificationMethod,
            Status = CapaStatus.Open,
            CreatedAt = _dateTime.UtcNow,
            UpdatedAt = _dateTime.UtcNow,
        };

        _db.Capas.Add(capa);

        foreach (var incidentId in req.LinkedIncidentIds)
        {
            _db.CapaIncidents.Add(new CapaIncident { CapaId = capa.Id, IncidentId = incidentId });
        }

        // Update incident statuses
        var incidents = await _db.Incidents
            .Where(i => req.LinkedIncidentIds.Contains(i.Id))
            .ToListAsync(ct);

        foreach (var incident in incidents)
        {
            if (incident.Status == IncidentStatus.InvestigationApproved)
                incident.TransitionTo(IncidentStatus.CapaAssigned);
        }

        await _db.SaveChangesAsync(ct);

        await _notifications.SendAsync(
            req.AssignedToId,
            NotificationType.CapaAssigned,
            "CAPA Assigned",
            $"You have been assigned CAPA {capa.CapaNumber}.",
            "Capa", capa.Id, cancellationToken: ct);

        var assignee = await _db.Users.FindAsync([req.AssignedToId], ct);

        return new CapaDetailResponse
        {
            Id = capa.Id,
            CapaNumber = capa.CapaNumber,
            Type = capa.Type.ToString(),
            Category = capa.Category.ToString(),
            Description = capa.Description,
            AssignedToId = capa.AssignedToId,
            AssignedTo = assignee?.DisplayName ?? "Unknown",
            Priority = capa.Priority.ToString(),
            Status = capa.Status.ToString(),
            DueDate = capa.DueDate,
            VerificationMethod = capa.VerificationMethod,
            CreatedAt = capa.CreatedAt,
        };
    }

    private async Task<string> GenerateCapaNumberAsync(CancellationToken ct)
    {
        var year = _dateTime.UtcNow.Year;
        var count = await _db.Capas.CountAsync(c => c.CreatedAt.Year == year, ct);
        return $"CAPA-{year}-{(count + 1):D3}";
    }
}

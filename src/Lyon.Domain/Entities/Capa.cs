using Lyon.Domain.DomainEvents;
using Lyon.Domain.Enums;
using Lyon.Domain.Exceptions;
using Lyon.Domain.Interfaces;

namespace Lyon.Domain.Entities;

public class Capa : AggregateRoot, ISoftDeletable
{
    public string CapaNumber { get; set; } = string.Empty;
    public CapaType Type { get; set; }
    public CapaCategory Category { get; set; }
    public string Description { get; set; } = string.Empty;
    public Guid AssignedToId { get; set; }
    public Guid? VerifiedById { get; set; }
    public CapaPriority Priority { get; set; }
    public CapaStatus Status { get; set; } = CapaStatus.Open;
    public DateTimeOffset DueDate { get; set; }
    public DateTimeOffset? VerificationDueDate { get; set; }
    public string? VerificationMethod { get; set; }
    public string? CompletionNotes { get; set; }
    public string? VerificationNotes { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
    public bool IsDeleted { get; set; }

    // Navigation
    public User AssignedTo { get; set; } = null!;
    public User? VerifiedBy { get; set; }
    public ICollection<CapaIncident> CapaIncidents { get; set; } = [];

    public static DateTimeOffset CalculateActionDueDate(CapaPriority priority, DateTimeOffset createdAt)
    {
        return priority switch
        {
            CapaPriority.Critical => createdAt.AddDays(7),
            CapaPriority.High => createdAt.AddDays(14),
            CapaPriority.Medium => createdAt.AddDays(30),
            CapaPriority.Low => createdAt.AddDays(60),
            _ => createdAt.AddDays(30)
        };
    }

    public static DateTimeOffset CalculateVerificationDueDate(CapaPriority priority, DateTimeOffset completedAt)
    {
        return priority switch
        {
            CapaPriority.Critical => completedAt.AddDays(30),
            CapaPriority.High => completedAt.AddDays(60),
            _ => completedAt.AddDays(90)
        };
    }

    public void TransitionTo(CapaStatus newStatus)
    {
        var allowed = Status switch
        {
            CapaStatus.Open => new[] { CapaStatus.InProgress },
            CapaStatus.InProgress => new[] { CapaStatus.Completed },
            CapaStatus.Completed => new[] { CapaStatus.VerificationPending },
            CapaStatus.VerificationPending => new[] { CapaStatus.VerifiedEffective, CapaStatus.VerifiedIneffective },
            _ => Array.Empty<CapaStatus>()
        };

        if (!allowed.Contains(newStatus))
            throw new InvalidStatusTransitionException(Status.ToString(), newStatus.ToString());

        var oldStatus = Status;
        Status = newStatus;

        if (newStatus == CapaStatus.Completed)
        {
            CompletedAt = DateTimeOffset.UtcNow;
            Status = CapaStatus.VerificationPending;
            VerificationDueDate = CalculateVerificationDueDate(Priority, CompletedAt.Value);
            newStatus = CapaStatus.VerificationPending;
        }

        if (newStatus is CapaStatus.VerifiedEffective or CapaStatus.VerifiedIneffective)
        {
            VerifiedAt = DateTimeOffset.UtcNow;
        }

        RaiseDomainEvent(new CapaStatusChangedEvent(Id, oldStatus, newStatus));
    }

    public bool CanBeVerifiedBy(Guid userId) => userId != AssignedToId;
}

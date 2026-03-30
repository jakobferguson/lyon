using Lyon.Domain.DomainEvents;
using Lyon.Domain.Enums;
using Lyon.Domain.Exceptions;
using Lyon.Domain.Interfaces;

namespace Lyon.Domain.Entities;

public class Investigation : AggregateRoot, ISoftDeletable
{
    public Guid IncidentId { get; set; }
    public Guid LeadInvestigatorId { get; set; }
    public Guid AssignedById { get; set; }
    public DateTimeOffset TargetCompletionDate { get; set; }
    public DateTimeOffset? ActualCompletionDate { get; set; }
    public string? RootCauseSummary { get; set; }
    public InvestigationStatus Status { get; set; } = InvestigationStatus.Open;
    public string? ReviewComments { get; set; }
    public Guid? ReviewedById { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public int InvestigationNumber { get; set; } = 1;
    public bool IsDeleted { get; set; }

    // Navigation
    public Incident Incident { get; set; } = null!;
    public User LeadInvestigator { get; set; } = null!;
    public User AssignedBy { get; set; } = null!;
    public User? ReviewedBy { get; set; }
    public ICollection<InvestigationTeamMember> TeamMembers { get; set; } = [];
    public ICollection<FiveWhyEntry> FiveWhyEntries { get; set; } = [];
    public ICollection<ContributingFactor> ContributingFactors { get; set; } = [];
    public ICollection<WitnessStatement> WitnessStatements { get; set; } = [];

    public static DateTimeOffset CalculateTargetDate(Severity? severity, DateTimeOffset incidentDate)
    {
        return severity switch
        {
            Severity.Fatality => incidentDate.AddHours(48),
            Severity.LostTime => AddBusinessDays(incidentDate, 5),
            Severity.MedicalTreatment => AddBusinessDays(incidentDate, 10),
            Severity.FirstAid => incidentDate.AddDays(14),
            Severity.NearMiss => incidentDate.AddDays(14),
            _ => incidentDate.AddDays(14)
        };
    }

    public void Approve(Guid reviewerId)
    {
        if (Status is not InvestigationStatus.Complete)
            throw new InvalidStatusTransitionException(Status.ToString(), InvestigationStatus.Approved.ToString());

        Status = InvestigationStatus.Approved;
        ReviewedById = reviewerId;
        ReviewedAt = DateTimeOffset.UtcNow;

        RaiseDomainEvent(new InvestigationApprovedEvent(Id, IncidentId, reviewerId));
    }

    public void Return(Guid reviewerId, string comments)
    {
        if (Status is not InvestigationStatus.Complete)
            throw new InvalidStatusTransitionException(Status.ToString(), InvestigationStatus.Returned.ToString());

        Status = InvestigationStatus.Returned;
        ReviewedById = reviewerId;
        ReviewedAt = DateTimeOffset.UtcNow;
        ReviewComments = comments;
    }

    public void MarkComplete()
    {
        if (Status is not (InvestigationStatus.Open or InvestigationStatus.InProgress or InvestigationStatus.Returned))
            throw new InvalidStatusTransitionException(Status.ToString(), InvestigationStatus.Complete.ToString());

        Status = InvestigationStatus.Complete;
        ActualCompletionDate = DateTimeOffset.UtcNow;
    }

    private static DateTimeOffset AddBusinessDays(DateTimeOffset start, int days)
    {
        var current = start;
        while (days > 0)
        {
            current = current.AddDays(1);
            if (current.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
                days--;
        }
        return current;
    }
}

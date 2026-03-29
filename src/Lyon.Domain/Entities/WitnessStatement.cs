namespace Lyon.Domain.Entities;

public class WitnessStatement : BaseEntity
{
    public Guid InvestigationId { get; set; }
    public string WitnessName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? Employer { get; set; }
    public string? Phone { get; set; }
    public string StatementText { get; set; } = string.Empty;
    public DateOnly CollectionDate { get; set; }
    public Guid CollectedById { get; set; }
    public Guid? ReferencesStatementId { get; set; }

    // Navigation
    public Investigation Investigation { get; set; } = null!;
    public User CollectedBy { get; set; } = null!;
    public WitnessStatement? ReferencesStatement { get; set; }
}

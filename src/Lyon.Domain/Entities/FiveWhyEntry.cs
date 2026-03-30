namespace Lyon.Domain.Entities;

public class FiveWhyEntry : BaseEntity
{
    public Guid InvestigationId { get; set; }
    public int Level { get; set; }
    public string WhyQuestion { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string? SupportingEvidence { get; set; }

    // Navigation
    public Investigation Investigation { get; set; } = null!;
}

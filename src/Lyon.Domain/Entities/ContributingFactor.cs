namespace Lyon.Domain.Entities;

public class ContributingFactor : BaseEntity
{
    public Guid InvestigationId { get; set; }
    public Guid FactorTypeId { get; set; }
    public bool IsPrimary { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Investigation Investigation { get; set; } = null!;
    public FactorType FactorType { get; set; } = null!;
}

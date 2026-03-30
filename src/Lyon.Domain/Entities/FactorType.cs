using Lyon.Domain.Enums;

namespace Lyon.Domain.Entities;

public class FactorType : BaseEntity
{
    public FactorCategory Category { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    // Navigation
    public ICollection<ContributingFactor> ContributingFactors { get; set; } = [];
}

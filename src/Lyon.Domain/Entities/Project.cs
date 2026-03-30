namespace Lyon.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public Guid DivisionId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Division Division { get; set; } = null!;
    public ICollection<Incident> Incidents { get; set; } = [];
}

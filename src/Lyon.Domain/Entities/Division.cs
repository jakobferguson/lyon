namespace Lyon.Domain.Entities;

public class Division : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Project> Projects { get; set; } = [];
    public ICollection<User> Users { get; set; } = [];
    public ICollection<Incident> Incidents { get; set; } = [];
    public ICollection<HoursWorked> HoursWorkedEntries { get; set; } = [];
}

namespace Lyon.Domain.Entities;

public class HoursWorked : BaseEntity
{
    public int Year { get; set; }
    public int Month { get; set; }
    public Guid? DivisionId { get; set; }
    public decimal Hours { get; set; }
    public Guid EnteredById { get; set; }

    // Navigation
    public Division? Division { get; set; }
    public User EnteredBy { get; set; } = null!;
}

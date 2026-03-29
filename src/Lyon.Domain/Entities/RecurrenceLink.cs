using Lyon.Domain.Interfaces;

namespace Lyon.Domain.Entities;

public class RecurrenceLink : BaseEntity, ISoftDeletable
{
    public Guid IncidentAId { get; set; }
    public Guid IncidentBId { get; set; }
    public string SimilarityTypes { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public Guid LinkedById { get; set; }
    public bool IsDeleted { get; set; }

    // Navigation
    public Incident IncidentA { get; set; } = null!;
    public Incident IncidentB { get; set; } = null!;
    public User LinkedBy { get; set; } = null!;
}

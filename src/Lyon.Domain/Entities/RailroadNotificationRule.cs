using Lyon.Domain.Enums;

namespace Lyon.Domain.Entities;

public class RailroadNotificationRule : BaseEntity
{
    public Guid RailroadId { get; set; }
    public IncidentType IncidentType { get; set; }
    public int DeadlineMinutes { get; set; }
    public bool IsWithinShift { get; set; }

    // Navigation
    public Railroad Railroad { get; set; } = null!;
}

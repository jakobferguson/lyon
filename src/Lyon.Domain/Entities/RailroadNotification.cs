using Lyon.Domain.Enums;

namespace Lyon.Domain.Entities;

public class RailroadNotification : BaseEntity
{
    public Guid IncidentId { get; set; }
    public Guid RailroadId { get; set; }
    public bool WasNotified { get; set; }
    public DateTimeOffset? NotificationDateTime { get; set; }
    public NotificationMethod? Method { get; set; }
    public string? PersonNotified { get; set; }
    public string? PersonTitle { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset Deadline { get; set; }
    public bool IsOverdue { get; set; }

    // Navigation
    public Incident Incident { get; set; } = null!;
    public Railroad Railroad { get; set; } = null!;
}

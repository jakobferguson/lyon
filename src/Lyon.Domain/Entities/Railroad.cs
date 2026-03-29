namespace Lyon.Domain.Entities;

public class Railroad : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<RailroadNotificationRule> NotificationRules { get; set; } = [];
    public ICollection<RailroadPropertyZone> PropertyZones { get; set; } = [];
    public ICollection<RailroadNotification> Notifications { get; set; } = [];
}

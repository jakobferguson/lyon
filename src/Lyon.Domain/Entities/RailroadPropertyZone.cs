namespace Lyon.Domain.Entities;

public class RailroadPropertyZone : BaseEntity
{
    public Guid RailroadId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double CenterLatitude { get; set; }
    public double CenterLongitude { get; set; }
    public double RadiusMeters { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Railroad Railroad { get; set; } = null!;
}

namespace Lyon.Domain.Entities;

public class CapaIncident
{
    public Guid CapaId { get; set; }
    public Guid IncidentId { get; set; }

    // Navigation
    public Capa Capa { get; set; } = null!;
    public Incident Incident { get; set; } = null!;
}

namespace Lyon.Domain.Entities;

public class IncidentPhoto : BaseEntity
{
    public Guid IncidentId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public int SortOrder { get; set; }
    public Guid UploadedById { get; set; }

    // Navigation
    public Incident Incident { get; set; } = null!;
    public User UploadedBy { get; set; } = null!;
}

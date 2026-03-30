namespace Lyon.Domain.Entities;

public class InvestigationTeamMember
{
    public Guid InvestigationId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset AddedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public Investigation Investigation { get; set; } = null!;
    public User User { get; set; } = null!;
}

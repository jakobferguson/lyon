using Lyon.Domain.Enums;
using Lyon.Domain.ValueObjects;

namespace Lyon.Domain.Entities;

public class InjuredPerson : BaseEntity
{
    public Guid IncidentId { get; set; }
    public EncryptedString Name { get; set; } = new(string.Empty);
    public string? JobTitle { get; set; }
    public Guid? DivisionId { get; set; }
    public InjuryType? InjuryType { get; set; }
    public BodyPart? BodyPart { get; set; }
    public BodySide? BodySide { get; set; }
    public EncryptedString? TreatmentType { get; set; }
    public EncryptedString? ReturnToWorkStatus { get; set; }
    public EncryptedString? DaysAway { get; set; }
    public EncryptedString? DaysRestricted { get; set; }

    // Navigation
    public Incident Incident { get; set; } = null!;
    public Division? Division { get; set; }
}

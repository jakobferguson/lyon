namespace Lyon.Domain.ValueObjects;

/// <summary>
/// Marker type for fields that require field-level encryption (HIPAA).
/// The actual encryption/decryption is handled by EF Core ValueConverter in Infrastructure.
/// </summary>
public record EncryptedString(string Value)
{
    public static implicit operator string(EncryptedString encrypted) => encrypted.Value;
    public static implicit operator EncryptedString(string value) => new(value);

    public override string ToString() => Value;
}

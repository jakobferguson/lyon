namespace Lyon.Domain.ValueObjects;

public record DateRange(DateTimeOffset Start, DateTimeOffset End)
{
    public bool Contains(DateTimeOffset date) => date >= Start && date <= End;
    public TimeSpan Duration => End - Start;
}

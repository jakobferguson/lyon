namespace Lyon.Domain.ValueObjects;

public record GpsCoordinate(double Latitude, double Longitude)
{
    public static GpsCoordinate? FromNullable(double? latitude, double? longitude)
        => latitude.HasValue && longitude.HasValue
            ? new GpsCoordinate(latitude.Value, longitude.Value)
            : null;
}

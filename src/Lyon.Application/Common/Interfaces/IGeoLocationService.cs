namespace Lyon.Application.Common.Interfaces;

public record GeoFenceMatch(Guid RailroadId, string RailroadName, Guid ZoneId, string ZoneName);

public interface IGeoLocationService
{
    Task<GeoFenceMatch?> CheckGeofenceAsync(double latitude, double longitude, CancellationToken cancellationToken = default);
}

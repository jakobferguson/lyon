using Lyon.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Infrastructure.GeoLocation;

public class GeofenceService : IGeoLocationService
{
    private readonly IApplicationDbContext _db;

    public GeofenceService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<GeoFenceMatch?> CheckGeofenceAsync(double latitude, double longitude, CancellationToken cancellationToken = default)
    {
        // Simple radius-based check using Haversine approximation
        var zones = await _db.RailroadPropertyZones
            .Include(z => z.Railroad)
            .Where(z => z.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var zone in zones)
        {
            var distance = HaversineDistance(latitude, longitude, zone.CenterLatitude, zone.CenterLongitude);
            if (distance <= zone.RadiusMeters)
            {
                return new GeoFenceMatch(zone.RailroadId, zone.Railroad.Name, zone.Id, zone.Name);
            }
        }

        return null;
    }

    private static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371000; // Earth's radius in meters
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180;
}

using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Lyon.Infrastructure.Persistence.Seeding;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        await db.Database.MigrateAsync();

        if (await db.Divisions.AnyAsync()) return;

        logger.LogInformation("Seeding database...");

        // Divisions
        var divisions = new Dictionary<string, Division>
        {
            ["HCC"] = new() { Id = Guid.NewGuid(), Code = "HCC", Name = "Herzog Contracting Corp" },
            ["HRSI"] = new() { Id = Guid.NewGuid(), Code = "HRSI", Name = "Herzog Railroad Services Inc" },
            ["HSI"] = new() { Id = Guid.NewGuid(), Code = "HSI", Name = "Herzog Services Inc" },
            ["HTI"] = new() { Id = Guid.NewGuid(), Code = "HTI", Name = "Herzog Technologies Inc" },
            ["HTSI"] = new() { Id = Guid.NewGuid(), Code = "HTSI", Name = "Herzog Transit Services Inc" },
            ["HE"] = new() { Id = Guid.NewGuid(), Code = "HE", Name = "Herzog Energy" },
            ["GG"] = new() { Id = Guid.NewGuid(), Code = "GG", Name = "Green Group" },
        };
        db.Divisions.AddRange(divisions.Values);

        // Dev users
        var users = new[]
        {
            new User { Id = Guid.NewGuid(), AzureAdObjectId = "dev-admin", Email = "admin@herzog.dev", DisplayName = "Admin User", Role = UserRole.Admin },
            new User { Id = Guid.NewGuid(), AzureAdObjectId = "dev-safetymgr", Email = "safetymgr@herzog.dev", DisplayName = "Sarah Safety", Role = UserRole.SafetyManager, DivisionId = divisions["HCC"].Id },
            new User { Id = Guid.NewGuid(), AzureAdObjectId = "dev-coordinator", Email = "coordinator@herzog.dev", DisplayName = "Chris Coordinator", Role = UserRole.SafetyCoordinator, DivisionId = divisions["HRSI"].Id },
            new User { Id = Guid.NewGuid(), AzureAdObjectId = "dev-reporter", Email = "reporter@herzog.dev", DisplayName = "Riley Reporter", Role = UserRole.FieldReporter, DivisionId = divisions["HSI"].Id },
            new User { Id = Guid.NewGuid(), AzureAdObjectId = "dev-projmgr", Email = "projmgr@herzog.dev", DisplayName = "Pat Manager", Role = UserRole.ProjectManager, DivisionId = divisions["HTI"].Id },
            new User { Id = Guid.NewGuid(), AzureAdObjectId = "dev-divmgr", Email = "divmgr@herzog.dev", DisplayName = "Dana Division", Role = UserRole.DivisionManager, DivisionId = divisions["HTSI"].Id },
            new User { Id = Guid.NewGuid(), AzureAdObjectId = "dev-exec", Email = "exec@herzog.dev", DisplayName = "Eva Executive", Role = UserRole.Executive },
        };
        db.Users.AddRange(users);

        // Railroads
        var bnsf = new Railroad { Id = Guid.NewGuid(), Name = "BNSF Railway", Code = "BNSF" };
        var up = new Railroad { Id = Guid.NewGuid(), Name = "Union Pacific", Code = "UP" };
        var csx = new Railroad { Id = Guid.NewGuid(), Name = "CSX Transportation", Code = "CSX" };
        var ns = new Railroad { Id = Guid.NewGuid(), Name = "Norfolk Southern", Code = "NS" };
        db.Railroads.AddRange(bnsf, up, csx, ns);

        // Railroad notification rules
        db.RailroadNotificationRules.AddRange(
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = bnsf.Id, IncidentType = IncidentType.Injury, DeadlineMinutes = 120 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = bnsf.Id, IncidentType = IncidentType.NearMiss, DeadlineMinutes = 1440 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = bnsf.Id, IncidentType = IncidentType.PropertyDamage, DeadlineMinutes = 240 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = up.Id, IncidentType = IncidentType.Injury, DeadlineMinutes = 15 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = up.Id, IncidentType = IncidentType.NearMiss, DeadlineMinutes = 1440 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = up.Id, IncidentType = IncidentType.PropertyDamage, DeadlineMinutes = 120 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = csx.Id, IncidentType = IncidentType.Injury, DeadlineMinutes = 60 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = csx.Id, IncidentType = IncidentType.NearMiss, DeadlineMinutes = 0, IsWithinShift = true },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = csx.Id, IncidentType = IncidentType.PropertyDamage, DeadlineMinutes = 60 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = ns.Id, IncidentType = IncidentType.Injury, DeadlineMinutes = 120 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = ns.Id, IncidentType = IncidentType.NearMiss, DeadlineMinutes = 1440 },
            new RailroadNotificationRule { Id = Guid.NewGuid(), RailroadId = ns.Id, IncidentType = IncidentType.PropertyDamage, DeadlineMinutes = 120 }
        );

        // Shift windows
        db.ShiftWindows.AddRange(
            new ShiftWindow { Id = Guid.NewGuid(), Name = "Day", StartTime = new TimeOnly(6, 0), EndTime = new TimeOnly(18, 0) },
            new ShiftWindow { Id = Guid.NewGuid(), Name = "Night", StartTime = new TimeOnly(18, 0), EndTime = new TimeOnly(6, 0) },
            new ShiftWindow { Id = Guid.NewGuid(), Name = "Swing", StartTime = new TimeOnly(14, 0), EndTime = new TimeOnly(2, 0) }
        );

        // Factor types
        var factorTypes = new (FactorCategory Cat, string Name)[]
        {
            (FactorCategory.People, "Training deficiency"), (FactorCategory.People, "Fatigue"),
            (FactorCategory.People, "Complacency"), (FactorCategory.People, "Communication failure"),
            (FactorCategory.People, "Inexperience"), (FactorCategory.People, "Impairment"),
            (FactorCategory.People, "PPE non-compliance"),
            (FactorCategory.Equipment, "Malfunction"), (FactorCategory.Equipment, "Poor maintenance"),
            (FactorCategory.Equipment, "Improper use"), (FactorCategory.Equipment, "Design deficiency"),
            (FactorCategory.Equipment, "Missing guards/safeguards"),
            (FactorCategory.Environmental, "Weather"), (FactorCategory.Environmental, "Lighting"),
            (FactorCategory.Environmental, "Noise"), (FactorCategory.Environmental, "Temperature"),
            (FactorCategory.Environmental, "Terrain"), (FactorCategory.Environmental, "Housekeeping"),
            (FactorCategory.Procedural, "No procedure exists"), (FactorCategory.Procedural, "Procedure not followed"),
            (FactorCategory.Procedural, "Procedure inadequate"), (FactorCategory.Procedural, "Permit/clearance failure"),
            (FactorCategory.ManagementOrganizational, "Inadequate supervision"),
            (FactorCategory.ManagementOrganizational, "Scheduling pressure"),
            (FactorCategory.ManagementOrganizational, "Resource shortage"),
            (FactorCategory.ManagementOrganizational, "Culture/norm"),
            (FactorCategory.ManagementOrganizational, "Change management failure"),
        };

        var sortOrder = 0;
        foreach (var (cat, name) in factorTypes)
        {
            db.FactorTypes.Add(new FactorType
            {
                Id = Guid.NewGuid(),
                Category = cat,
                Name = name,
                SortOrder = sortOrder++,
            });
        }

        await db.SaveChangesAsync();
        logger.LogInformation("Database seeded successfully.");
    }
}

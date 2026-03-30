using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Lyon.Infrastructure.Persistence.Seeding;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        // EnsureCreatedAsync skips if *any* non-system tables exist (e.g. Hangfire
        // tables created by the worker). Instead, probe for our own table and create
        // the application schema explicitly when missing.
        bool tablesExist;
        try
        {
            await db.Divisions.AnyAsync();
            tablesExist = true;
        }
        catch (PostgresException ex) when (ex.SqlState == "42P01")
        {
            tablesExist = false;
        }

        if (!tablesExist)
        {
            logger.LogInformation("Application tables not found — creating schema...");
            var creator = db.GetService<IRelationalDatabaseCreator>();
            await creator.CreateTablesAsync();
        }

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

        // Save reference data first so FKs are available
        await db.SaveChangesAsync();

        // ── Incidents (matching frontend INCIDENT_SEED) ─────────────────────
        var reporter = users[3]; // Riley Reporter
        var safetyMgr = users[1]; // Sarah Safety

        var incidents = new[]
        {
            new Incident
            {
                Id = Guid.NewGuid(),
                IncidentNumber = "INC-2026-001",
                IncidentType = IncidentType.Injury,
                DateTime = new DateTimeOffset(2026, 3, 10, 8, 30, 0, TimeSpan.Zero),
                Description = "Employee sustained laceration to left hand while handling rail anchors.",
                Severity = Severity.MedicalTreatment,
                Status = IncidentStatus.UnderInvestigation,
                LocationLatitude = 39.7684,
                LocationLongitude = -86.1581,
                LocationDescription = "MP 142.3 — Indianapolis Sub",
                LocationGpsSource = "gps",
                DivisionId = divisions["HCC"].Id,
                ReportedById = reporter.Id,
                IsOshaRecordable = true,
                IsDart = false,
                OnRailroadProperty = true,
                RailroadId = bnsf.Id,
                Shift = Shift.Day,
            },
            new Incident
            {
                Id = Guid.NewGuid(),
                IncidentNumber = "INC-2026-002",
                IncidentType = IncidentType.NearMiss,
                DateTime = new DateTimeOffset(2026, 3, 14, 14, 15, 0, TimeSpan.Zero),
                Description = "Hi-rail vehicle and track geometry car approached same block without proper authority.",
                Severity = Severity.NearMiss,
                Status = IncidentStatus.Reported,
                LocationLatitude = 39.0997,
                LocationLongitude = -94.5786,
                LocationDescription = "KC Yard — Track 7",
                LocationGpsSource = "gps",
                DivisionId = divisions["HRSI"].Id,
                ReportedById = reporter.Id,
                OnRailroadProperty = true,
                RailroadId = up.Id,
                Shift = Shift.Day,
            },
            new Incident
            {
                Id = Guid.NewGuid(),
                IncidentNumber = "INC-2026-003",
                IncidentType = IncidentType.PropertyDamage,
                DateTime = new DateTimeOffset(2026, 3, 18, 11, 0, 0, TimeSpan.Zero),
                Description = "Forklift clipped signal bungalow corner during material offload.",
                Severity = Severity.FirstAid,
                Status = IncidentStatus.CapaAssigned,
                LocationLatitude = 39.7392,
                LocationLongitude = -104.9903,
                LocationDescription = "Denver Yard — Offload Bay 2",
                LocationGpsSource = "manual",
                DivisionId = divisions["HTI"].Id,
                ReportedById = reporter.Id,
                IsOshaRecordable = true,
                IsDart = false,
                OnRailroadProperty = false,
                Shift = Shift.Day,
            },
            new Incident
            {
                Id = Guid.NewGuid(),
                IncidentNumber = "INC-2026-004",
                IncidentType = IncidentType.Vehicle,
                DateTime = new DateTimeOffset(2026, 3, 20, 7, 45, 0, TimeSpan.Zero),
                Description = "Company truck backed into guardrail at project staging area.",
                Severity = Severity.FirstAid,
                Status = IncidentStatus.Draft,
                LocationLatitude = 40.6936,
                LocationLongitude = -89.5890,
                LocationDescription = "IL Route 9 — Staging Area North",
                LocationGpsSource = "manual",
                DivisionId = divisions["HSI"].Id,
                ReportedById = reporter.Id,
                OnRailroadProperty = false,
                Shift = Shift.Day,
            },
            new Incident
            {
                Id = Guid.NewGuid(),
                IncidentNumber = "INC-2026-005",
                IncidentType = IncidentType.Injury,
                DateTime = new DateTimeOffset(2026, 3, 25, 16, 20, 0, TimeSpan.Zero),
                Description = "Worker fell approximately 4 feet from bridge deck form. Ankle fracture confirmed.",
                Severity = Severity.LostTime,
                Status = IncidentStatus.InvestigationApproved,
                LocationLatitude = 41.8781,
                LocationLongitude = -87.6298,
                LocationDescription = "Bridge MP 88 — Deck Form East",
                LocationGpsSource = "gps",
                DivisionId = divisions["HCC"].Id,
                ReportedById = reporter.Id,
                IsOshaRecordable = true,
                IsDart = true,
                OnRailroadProperty = true,
                RailroadId = csx.Id,
                Shift = Shift.Day,
            },
        };
        db.Incidents.AddRange(incidents);

        // Additional historical incidents for trend data (Apr 2025 – Feb 2026)
        var historicalIncidents = new List<Incident>();
        var rng = new Random(42); // deterministic seed
        var incidentNum = 6;
        var historicalTypes = new[] { IncidentType.Injury, IncidentType.NearMiss, IncidentType.PropertyDamage, IncidentType.Environmental, IncidentType.Vehicle };
        var historicalSeverities = new[] { Severity.LostTime, Severity.MedicalTreatment, Severity.FirstAid, Severity.NearMiss };
        var divisionKeys = new[] { "HCC", "HRSI", "HSI", "HTI", "HTSI", "HE", "GG" };
        var statuses = new[] { IncidentStatus.Closed, IncidentStatus.Reported, IncidentStatus.CapaInProgress };

        for (var month = 4; month <= 14; month++) // Apr 2025 (4) through Feb 2026 (14)
        {
            var year = month <= 12 ? 2025 : 2026;
            var m = month <= 12 ? month : month - 12;
            var count = rng.Next(5, 12); // 5-11 incidents per month

            for (var i = 0; i < count; i++)
            {
                var type = historicalTypes[rng.Next(historicalTypes.Length)];
                var sev = type == IncidentType.NearMiss ? Severity.NearMiss : historicalSeverities[rng.Next(3)]; // non-near-miss get first 3
                var divKey = divisionKeys[rng.Next(divisionKeys.Length)];
                var isRecordable = type != IncidentType.NearMiss && sev != Severity.FirstAid;
                var isDart = sev == Severity.LostTime;

                historicalIncidents.Add(new Incident
                {
                    Id = Guid.NewGuid(),
                    IncidentNumber = $"INC-{year}-{incidentNum++:D3}",
                    IncidentType = type,
                    DateTime = new DateTimeOffset(year, m, rng.Next(1, 28), rng.Next(6, 18), 0, 0, TimeSpan.Zero),
                    Description = $"Historical seed incident — {type} ({sev})",
                    Severity = sev,
                    Status = statuses[rng.Next(statuses.Length)],
                    LocationDescription = $"Project site — {divKey}",
                    LocationGpsSource = "manual",
                    DivisionId = divisions[divKey].Id,
                    ReportedById = reporter.Id,
                    IsOshaRecordable = isRecordable,
                    IsDart = isDart,
                    OnRailroadProperty = rng.Next(2) == 1,
                });
            }
        }
        db.Incidents.AddRange(historicalIncidents);

        // ── Hours worked (needed for TRIR/DART calculations) ────────────────
        var hoursEntries = new List<HoursWorked>();
        for (var month = 4; month <= 14; month++)
        {
            var year = month <= 12 ? 2025 : 2026;
            var m = month <= 12 ? month : month - 12;

            // Company-wide entry (no division)
            hoursEntries.Add(new HoursWorked
            {
                Id = Guid.NewGuid(),
                Year = year,
                Month = m,
                Hours = 98_000m + rng.Next(-5000, 5000),
                EnteredById = safetyMgr.Id,
            });

            // Per-division entries
            var divHours = new Dictionary<string, decimal>
            {
                ["HCC"] = 27_000m, ["HRSI"] = 18_000m, ["HSI"] = 15_000m,
                ["HTI"] = 13_000m, ["HTSI"] = 12_000m, ["HE"] = 8_000m, ["GG"] = 5_000m,
            };
            foreach (var (divCode, baseHours) in divHours)
            {
                hoursEntries.Add(new HoursWorked
                {
                    Id = Guid.NewGuid(),
                    Year = year,
                    Month = m,
                    DivisionId = divisions[divCode].Id,
                    Hours = baseHours + rng.Next(-2000, 2000),
                    EnteredById = safetyMgr.Id,
                });
            }
        }
        // March 2026 (current month)
        hoursEntries.Add(new HoursWorked
        {
            Id = Guid.NewGuid(), Year = 2026, Month = 3,
            Hours = 95_000m, EnteredById = safetyMgr.Id,
        });
        db.HoursWorkedEntries.AddRange(hoursEntries);

        // ── Investigations ──────────────────────────────────────────────────
        var coordinator = users[2]; // Chris Coordinator

        var investigations = new[]
        {
            // INC-001: Hand laceration — open, in progress
            new Investigation
            {
                Id = Guid.NewGuid(),
                InvestigationNumber = 1,
                IncidentId = incidents[0].Id,
                LeadInvestigatorId = coordinator.Id,
                AssignedById = safetyMgr.Id,
                TargetCompletionDate = new DateTimeOffset(2026, 3, 20, 0, 0, 0, TimeSpan.Zero),
                Status = InvestigationStatus.InProgress,
                RootCauseSummary = "Improper glove selection for anchor handling task. Worker was using general-purpose gloves instead of cut-resistant gloves required by JSA.",
            },
            // INC-003: Forklift/signal bungalow — complete, awaiting approval
            new Investigation
            {
                Id = Guid.NewGuid(),
                InvestigationNumber = 2,
                IncidentId = incidents[2].Id,
                LeadInvestigatorId = coordinator.Id,
                AssignedById = safetyMgr.Id,
                TargetCompletionDate = new DateTimeOffset(2026, 4, 1, 0, 0, 0, TimeSpan.Zero),
                Status = InvestigationStatus.Complete,
                RootCauseSummary = "Inadequate swing radius markings around signal bungalow. Operator did not perform 360-degree walk-around before operating forklift in confined area.",
                ActualCompletionDate = new DateTimeOffset(2026, 3, 26, 0, 0, 0, TimeSpan.Zero),
            },
            // INC-005: Fall from bridge deck — approved
            new Investigation
            {
                Id = Guid.NewGuid(),
                InvestigationNumber = 3,
                IncidentId = incidents[4].Id,
                LeadInvestigatorId = safetyMgr.Id,
                AssignedById = safetyMgr.Id,
                TargetCompletionDate = new DateTimeOffset(2026, 4, 1, 0, 0, 0, TimeSpan.Zero),
                Status = InvestigationStatus.Approved,
                RootCauseSummary = "Fall protection anchor point was not installed on east side of deck form. Pre-task plan did not address leading edge exposure during form stripping.",
                ActualCompletionDate = new DateTimeOffset(2026, 3, 28, 0, 0, 0, TimeSpan.Zero),
                ReviewedById = safetyMgr.Id,
                ReviewedAt = new DateTimeOffset(2026, 3, 29, 0, 0, 0, TimeSpan.Zero),
            },
            // INC-002: Near miss — open
            new Investigation
            {
                Id = Guid.NewGuid(),
                InvestigationNumber = 4,
                IncidentId = incidents[1].Id,
                LeadInvestigatorId = coordinator.Id,
                AssignedById = safetyMgr.Id,
                TargetCompletionDate = new DateTimeOffset(2026, 3, 28, 0, 0, 0, TimeSpan.Zero),
                Status = InvestigationStatus.Open,
            },
        };
        db.Investigations.AddRange(investigations);

        // ── CAPAs ───────────────────────────────────────────────────────────
        var projMgr = users[4]; // Pat Manager

        var capas = new[]
        {
            // From INC-001 investigation: glove policy
            new Capa
            {
                Id = Guid.NewGuid(),
                CapaNumber = "CAPA-2026-001",
                Type = CapaType.Corrective,
                Category = CapaCategory.PPE,
                Description = "Issue cut-resistant (ANSI A4+) gloves to all rail anchor handling crews and update JSA to specify required PPE.",
                AssignedToId = projMgr.Id,
                Priority = CapaPriority.High,
                Status = CapaStatus.InProgress,
                DueDate = new DateTimeOffset(2026, 4, 7, 0, 0, 0, TimeSpan.Zero),
            },
            // From INC-001 investigation: training
            new Capa
            {
                Id = Guid.NewGuid(),
                CapaNumber = "CAPA-2026-002",
                Type = CapaType.Preventive,
                Category = CapaCategory.Training,
                Description = "Conduct hands-on PPE selection refresher training for all field crews, emphasizing cut-hazard recognition.",
                AssignedToId = coordinator.Id,
                Priority = CapaPriority.Medium,
                Status = CapaStatus.Open,
                DueDate = new DateTimeOffset(2026, 4, 15, 0, 0, 0, TimeSpan.Zero),
            },
            // From INC-003 investigation: engineering control
            new Capa
            {
                Id = Guid.NewGuid(),
                CapaNumber = "CAPA-2026-003",
                Type = CapaType.Corrective,
                Category = CapaCategory.EngineeringControl,
                Description = "Install bollards and swing-radius floor markings around all signal bungalows at Denver Yard.",
                AssignedToId = projMgr.Id,
                Priority = CapaPriority.High,
                Status = CapaStatus.Open,
                DueDate = new DateTimeOffset(2026, 4, 10, 0, 0, 0, TimeSpan.Zero),
            },
            // From INC-005 investigation: fall protection
            new Capa
            {
                Id = Guid.NewGuid(),
                CapaNumber = "CAPA-2026-004",
                Type = CapaType.Corrective,
                Category = CapaCategory.EngineeringControl,
                Description = "Install permanent fall protection anchor points on all bridge deck forms prior to stripping operations.",
                AssignedToId = projMgr.Id,
                Priority = CapaPriority.Critical,
                Status = CapaStatus.InProgress,
                DueDate = new DateTimeOffset(2026, 4, 3, 0, 0, 0, TimeSpan.Zero),
            },
            // From INC-005 investigation: procedure change
            new Capa
            {
                Id = Guid.NewGuid(),
                CapaNumber = "CAPA-2026-005",
                Type = CapaType.Preventive,
                Category = CapaCategory.ProcedureChange,
                Description = "Revise pre-task planning template to include mandatory leading-edge exposure assessment for elevated work.",
                AssignedToId = safetyMgr.Id,
                Priority = CapaPriority.High,
                Status = CapaStatus.VerificationPending,
                DueDate = new DateTimeOffset(2026, 3, 28, 0, 0, 0, TimeSpan.Zero),
                CompletedAt = new DateTimeOffset(2026, 3, 27, 0, 0, 0, TimeSpan.Zero),
                VerificationDueDate = new DateTimeOffset(2026, 5, 27, 0, 0, 0, TimeSpan.Zero),
                VerificationMethod = "Audit 10 pre-task plans from bridge crews over 60 days to confirm leading-edge section is completed.",
            },
            // Closed/verified CAPA for historical data
            new Capa
            {
                Id = Guid.NewGuid(),
                CapaNumber = "CAPA-2026-006",
                Type = CapaType.Corrective,
                Category = CapaCategory.Training,
                Description = "Retrain forklift operators on walk-around inspection and confined-area operating procedures.",
                AssignedToId = coordinator.Id,
                Priority = CapaPriority.Medium,
                Status = CapaStatus.VerifiedEffective,
                DueDate = new DateTimeOffset(2026, 3, 25, 0, 0, 0, TimeSpan.Zero),
                CompletedAt = new DateTimeOffset(2026, 3, 24, 0, 0, 0, TimeSpan.Zero),
                VerifiedAt = new DateTimeOffset(2026, 3, 28, 0, 0, 0, TimeSpan.Zero),
                VerifiedById = safetyMgr.Id,
                VerificationDueDate = new DateTimeOffset(2026, 5, 24, 0, 0, 0, TimeSpan.Zero),
                VerificationMethod = "Observe 5 forklift operations for compliance with walk-around and confined-area procedures.",
                VerificationNotes = "All 5 observed operations showed full compliance. Operators demonstrated proper walk-around and clearance checks.",
            },
        };
        db.Capas.AddRange(capas);

        // Link CAPAs to incidents
        db.Set<CapaIncident>().AddRange(
            new CapaIncident { CapaId = capas[0].Id, IncidentId = incidents[0].Id },
            new CapaIncident { CapaId = capas[1].Id, IncidentId = incidents[0].Id },
            new CapaIncident { CapaId = capas[2].Id, IncidentId = incidents[2].Id },
            new CapaIncident { CapaId = capas[3].Id, IncidentId = incidents[4].Id },
            new CapaIncident { CapaId = capas[4].Id, IncidentId = incidents[4].Id },
            new CapaIncident { CapaId = capas[5].Id, IncidentId = incidents[2].Id }
        );

        await db.SaveChangesAsync();
        logger.LogInformation("Database seeded successfully.");
    }
}

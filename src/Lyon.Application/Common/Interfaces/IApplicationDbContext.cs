using Lyon.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Division> Divisions { get; }
    DbSet<User> Users { get; }
    DbSet<Project> Projects { get; }
    DbSet<Incident> Incidents { get; }
    DbSet<InjuredPerson> InjuredPersons { get; }
    DbSet<IncidentPhoto> IncidentPhotos { get; }
    DbSet<Investigation> Investigations { get; }
    DbSet<InvestigationTeamMember> InvestigationTeamMembers { get; }
    DbSet<FiveWhyEntry> FiveWhyEntries { get; }
    DbSet<FactorType> FactorTypes { get; }
    DbSet<ContributingFactor> ContributingFactors { get; }
    DbSet<WitnessStatement> WitnessStatements { get; }
    DbSet<Capa> Capas { get; }
    DbSet<CapaIncident> CapaIncidents { get; }
    DbSet<RecurrenceLink> RecurrenceLinks { get; }
    DbSet<Railroad> Railroads { get; }
    DbSet<RailroadNotificationRule> RailroadNotificationRules { get; }
    DbSet<RailroadPropertyZone> RailroadPropertyZones { get; }
    DbSet<RailroadNotification> RailroadNotifications { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AuditLogEntry> AuditLogEntries { get; }
    DbSet<HoursWorked> HoursWorkedEntries { get; }
    DbSet<ShiftWindow> ShiftWindows { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

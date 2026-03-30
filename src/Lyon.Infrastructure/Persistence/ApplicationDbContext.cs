using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Division> Divisions => Set<Division>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<InjuredPerson> InjuredPersons => Set<InjuredPerson>();
    public DbSet<IncidentPhoto> IncidentPhotos => Set<IncidentPhoto>();
    public DbSet<Investigation> Investigations => Set<Investigation>();
    public DbSet<InvestigationTeamMember> InvestigationTeamMembers => Set<InvestigationTeamMember>();
    public DbSet<FiveWhyEntry> FiveWhyEntries => Set<FiveWhyEntry>();
    public DbSet<FactorType> FactorTypes => Set<FactorType>();
    public DbSet<ContributingFactor> ContributingFactors => Set<ContributingFactor>();
    public DbSet<WitnessStatement> WitnessStatements => Set<WitnessStatement>();
    public DbSet<Capa> Capas => Set<Capa>();
    public DbSet<CapaIncident> CapaIncidents => Set<CapaIncident>();
    public DbSet<RecurrenceLink> RecurrenceLinks => Set<RecurrenceLink>();
    public DbSet<Railroad> Railroads => Set<Railroad>();
    public DbSet<RailroadNotificationRule> RailroadNotificationRules => Set<RailroadNotificationRule>();
    public DbSet<RailroadPropertyZone> RailroadPropertyZones => Set<RailroadPropertyZone>();
    public DbSet<RailroadNotification> RailroadNotifications => Set<RailroadNotification>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLogEntry> AuditLogEntries => Set<AuditLogEntry>();
    public DbSet<HoursWorked> HoursWorkedEntries => Set<HoursWorked>();
    public DbSet<ShiftWindow> ShiftWindows => Set<ShiftWindow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        modelBuilder.HasPostgresExtension("postgis");
    }
}

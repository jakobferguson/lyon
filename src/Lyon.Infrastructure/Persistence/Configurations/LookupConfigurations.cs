using Lyon.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lyon.Infrastructure.Persistence.Configurations;

public class DivisionConfiguration : IEntityTypeConfiguration<Division>
{
    public void Configure(EntityTypeBuilder<Division> builder)
    {
        builder.ToTable("divisions");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Code).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.Code).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.AzureAdObjectId).HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.AzureAdObjectId).IsUnique();
        builder.Property(e => e.Email).HasMaxLength(320).IsRequired();
        builder.HasIndex(e => e.Email).IsUnique();
        builder.Property(e => e.DisplayName).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Role).HasConversion<string>().HasMaxLength(30);
        builder.HasOne(e => e.Division).WithMany(d => d.Users).HasForeignKey(e => e.DivisionId);
        builder.HasIndex(e => e.DivisionId);
    }
}

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("projects");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Code).HasMaxLength(50);
        builder.HasOne(e => e.Division).WithMany(d => d.Projects).HasForeignKey(e => e.DivisionId);
        builder.HasIndex(e => e.DivisionId);
    }
}

public class FactorTypeConfiguration : IEntityTypeConfiguration<FactorType>
{
    public void Configure(EntityTypeBuilder<FactorType> builder)
    {
        builder.ToTable("factor_types");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Category).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Name).HasMaxLength(200);
        builder.HasIndex(e => new { e.Category, e.Name }).IsUnique();
    }
}

public class RailroadConfiguration : IEntityTypeConfiguration<Railroad>
{
    public void Configure(EntityTypeBuilder<Railroad> builder)
    {
        builder.ToTable("railroads");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Code).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.Code).IsUnique();
    }
}

public class RailroadNotificationRuleConfiguration : IEntityTypeConfiguration<RailroadNotificationRule>
{
    public void Configure(EntityTypeBuilder<RailroadNotificationRule> builder)
    {
        builder.ToTable("railroad_notification_rules");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.IncidentType).HasConversion<string>().HasMaxLength(30);
        builder.HasOne(e => e.Railroad).WithMany(r => r.NotificationRules).HasForeignKey(e => e.RailroadId);
        builder.HasIndex(e => new { e.RailroadId, e.IncidentType }).IsUnique();
    }
}

public class RailroadPropertyZoneConfiguration : IEntityTypeConfiguration<RailroadPropertyZone>
{
    public void Configure(EntityTypeBuilder<RailroadPropertyZone> builder)
    {
        builder.ToTable("railroad_property_zones");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(200);
        builder.HasOne(e => e.Railroad).WithMany(r => r.PropertyZones).HasForeignKey(e => e.RailroadId);
        builder.HasIndex(e => e.RailroadId);
    }
}

public class RailroadNotificationConfiguration : IEntityTypeConfiguration<RailroadNotification>
{
    public void Configure(EntityTypeBuilder<RailroadNotification> builder)
    {
        builder.ToTable("railroad_notifications");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Method).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.PersonNotified).HasMaxLength(200);
        builder.Property(e => e.PersonTitle).HasMaxLength(200);
        builder.HasOne(e => e.Incident).WithMany(i => i.RailroadNotifications).HasForeignKey(e => e.IncidentId);
        builder.HasOne(e => e.Railroad).WithMany(r => r.Notifications).HasForeignKey(e => e.RailroadId);
        builder.HasIndex(e => e.IncidentId);
        builder.HasIndex(e => e.IsOverdue);
    }
}

public class RecurrenceLinkConfiguration : IEntityTypeConfiguration<RecurrenceLink>
{
    public void Configure(EntityTypeBuilder<RecurrenceLink> builder)
    {
        builder.ToTable("recurrence_links");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.SimilarityTypes).HasMaxLength(200);
        builder.HasOne(e => e.IncidentA).WithMany().HasForeignKey(e => e.IncidentAId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.IncidentB).WithMany().HasForeignKey(e => e.IncidentBId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.LinkedBy).WithMany().HasForeignKey(e => e.LinkedById);
        builder.HasIndex(e => new { e.IncidentAId, e.IncidentBId }).IsUnique();
        builder.HasIndex(e => e.IncidentAId);
        builder.HasIndex(e => e.IncidentBId);
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.Title).HasMaxLength(300);
        builder.Property(e => e.Summary).HasMaxLength(500);
        builder.Property(e => e.EntityType).HasMaxLength(50);
        builder.HasOne(e => e.Recipient).WithMany().HasForeignKey(e => e.RecipientId);
        builder.HasIndex(e => new { e.RecipientId, e.IsRead });
        builder.HasIndex(e => e.CreatedAt);
        builder.HasIndex(e => e.IsPersistentBanner);
    }
}

public class AuditLogEntryConfiguration : IEntityTypeConfiguration<AuditLogEntry>
{
    public void Configure(EntityTypeBuilder<AuditLogEntry> builder)
    {
        builder.ToTable("audit_log_entries");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).UseIdentityAlwaysColumn();
        builder.Property(e => e.Action).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.EntityType).HasMaxLength(50);
        builder.Property(e => e.FieldName).HasMaxLength(100);
        builder.Property(e => e.UserDisplayName).HasMaxLength(200);
        builder.Property(e => e.IpAddress).HasMaxLength(45);
        builder.Property(e => e.UserAgent).HasMaxLength(500);
        builder.Property(e => e.CorrelationId).HasMaxLength(50);
        builder.HasIndex(e => new { e.EntityType, e.EntityId });
        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.Timestamp);
        builder.HasIndex(e => e.Action);
    }
}

public class HoursWorkedConfiguration : IEntityTypeConfiguration<HoursWorked>
{
    public void Configure(EntityTypeBuilder<HoursWorked> builder)
    {
        builder.ToTable("hours_worked");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Hours).HasPrecision(12, 2);
        builder.HasOne(e => e.Division).WithMany(d => d.HoursWorkedEntries).HasForeignKey(e => e.DivisionId);
        builder.HasOne(e => e.EnteredBy).WithMany().HasForeignKey(e => e.EnteredById);
        builder.HasIndex(e => new { e.Year, e.Month, e.DivisionId }).IsUnique();
    }
}

public class ShiftWindowConfiguration : IEntityTypeConfiguration<ShiftWindow>
{
    public void Configure(EntityTypeBuilder<ShiftWindow> builder)
    {
        builder.ToTable("shift_windows");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.Name).IsUnique();
    }
}

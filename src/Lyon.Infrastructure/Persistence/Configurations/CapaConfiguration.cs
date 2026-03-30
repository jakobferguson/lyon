using Lyon.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lyon.Infrastructure.Persistence.Configurations;

public class CapaConfiguration : IEntityTypeConfiguration<Capa>
{
    public void Configure(EntityTypeBuilder<Capa> builder)
    {
        builder.ToTable("capas");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.CapaNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.CapaNumber).IsUnique();
        builder.Property(e => e.Type).HasConversion<string>().HasMaxLength(15);
        builder.Property(e => e.Category).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Priority).HasConversion<string>().HasMaxLength(10);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
        builder.HasOne(e => e.AssignedTo).WithMany().HasForeignKey(e => e.AssignedToId);
        builder.HasOne(e => e.VerifiedBy).WithMany().HasForeignKey(e => e.VerifiedById);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.AssignedToId);
        builder.HasIndex(e => e.DueDate);
        builder.HasIndex(e => e.Priority);
        builder.HasQueryFilter(e => !e.IsDeleted);
        builder.Ignore(e => e.DomainEvents);
    }
}

public class CapaIncidentConfiguration : IEntityTypeConfiguration<CapaIncident>
{
    public void Configure(EntityTypeBuilder<CapaIncident> builder)
    {
        builder.ToTable("capa_incidents");
        builder.HasKey(e => new { e.CapaId, e.IncidentId });
        builder.HasOne(e => e.Capa).WithMany(c => c.CapaIncidents).HasForeignKey(e => e.CapaId);
        builder.HasOne(e => e.Incident).WithMany(i => i.CapaIncidents).HasForeignKey(e => e.IncidentId);
    }
}

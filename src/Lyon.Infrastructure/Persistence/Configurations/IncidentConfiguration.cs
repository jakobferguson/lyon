using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lyon.Infrastructure.Persistence.Configurations;

public class IncidentConfiguration : IEntityTypeConfiguration<Incident>
{
    public void Configure(EntityTypeBuilder<Incident> builder)
    {
        builder.ToTable("incidents");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.IncidentNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.IncidentNumber).IsUnique();
        builder.Property(e => e.IncidentType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Severity).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.PotentialSeverity).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Shift).HasConversion<string>().HasMaxLength(10);
        builder.Property(e => e.Weather).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.TimezoneId).HasMaxLength(50);
        builder.Property(e => e.LocationDescription).HasMaxLength(500);
        builder.Property(e => e.LocationGpsSource).HasMaxLength(10);

        builder.HasOne(e => e.Division).WithMany(d => d.Incidents).HasForeignKey(e => e.DivisionId);
        builder.HasOne(e => e.Project).WithMany(p => p.Incidents).HasForeignKey(e => e.ProjectId);
        builder.HasOne(e => e.ReportedBy).WithMany().HasForeignKey(e => e.ReportedById);
        builder.HasOne(e => e.Railroad).WithMany().HasForeignKey(e => e.RailroadId);
        builder.HasOne(e => e.OshaDeterminedBy).WithMany().HasForeignKey(e => e.OshaDeterminedById);

        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.DivisionId);
        builder.HasIndex(e => e.ReportedById);
        builder.HasIndex(e => e.DateTime);
        builder.HasIndex(e => e.IncidentType);
        builder.HasIndex(e => e.CreatedAt);

        builder.HasQueryFilter(e => !e.IsDeleted);
        builder.Ignore(e => e.DomainEvents);
    }
}

public class InjuredPersonConfiguration : IEntityTypeConfiguration<InjuredPerson>
{
    public void Configure(EntityTypeBuilder<InjuredPerson> builder)
    {
        builder.ToTable("injured_persons");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.InjuryType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.BodyPart).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.BodySide).HasConversion<string>().HasMaxLength(15);
        builder.Property(e => e.JobTitle).HasMaxLength(200);

        // Encrypted fields stored as varchar(500)
        builder.Property(e => e.Name).HasMaxLength(500).HasConversion(v => v.Value, v => new(v));
        builder.Property(e => e.TreatmentType).HasMaxLength(500).HasConversion(v => v != null ? v.Value : null, v => v != null ? new(v) : null);
        builder.Property(e => e.ReturnToWorkStatus).HasMaxLength(500).HasConversion(v => v != null ? v.Value : null, v => v != null ? new(v) : null);
        builder.Property(e => e.DaysAway).HasMaxLength(500).HasConversion(v => v != null ? v.Value : null, v => v != null ? new(v) : null);
        builder.Property(e => e.DaysRestricted).HasMaxLength(500).HasConversion(v => v != null ? v.Value : null, v => v != null ? new(v) : null);

        builder.HasOne(e => e.Incident).WithMany(i => i.InjuredPersons).HasForeignKey(e => e.IncidentId);
        builder.HasOne(e => e.Division).WithMany().HasForeignKey(e => e.DivisionId);
        builder.HasIndex(e => e.IncidentId);
    }
}

public class IncidentPhotoConfiguration : IEntityTypeConfiguration<IncidentPhoto>
{
    public void Configure(EntityTypeBuilder<IncidentPhoto> builder)
    {
        builder.ToTable("incident_photos");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.FileName).HasMaxLength(255);
        builder.Property(e => e.StoragePath).HasMaxLength(500);
        builder.Property(e => e.ContentType).HasMaxLength(50);
        builder.HasOne(e => e.Incident).WithMany(i => i.Photos).HasForeignKey(e => e.IncidentId);
        builder.HasOne(e => e.UploadedBy).WithMany().HasForeignKey(e => e.UploadedById);
        builder.HasIndex(e => e.IncidentId);
    }
}

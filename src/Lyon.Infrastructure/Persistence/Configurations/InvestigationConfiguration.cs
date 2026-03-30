using Lyon.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lyon.Infrastructure.Persistence.Configurations;

public class InvestigationConfiguration : IEntityTypeConfiguration<Investigation>
{
    public void Configure(EntityTypeBuilder<Investigation> builder)
    {
        builder.ToTable("investigations");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
        builder.HasOne(e => e.Incident).WithMany(i => i.Investigations).HasForeignKey(e => e.IncidentId);
        builder.HasOne(e => e.LeadInvestigator).WithMany().HasForeignKey(e => e.LeadInvestigatorId);
        builder.HasOne(e => e.AssignedBy).WithMany().HasForeignKey(e => e.AssignedById);
        builder.HasOne(e => e.ReviewedBy).WithMany().HasForeignKey(e => e.ReviewedById);
        builder.HasIndex(e => e.IncidentId);
        builder.HasIndex(e => e.LeadInvestigatorId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.TargetCompletionDate);
        builder.HasQueryFilter(e => !e.IsDeleted);
        builder.Ignore(e => e.DomainEvents);
    }
}

public class InvestigationTeamMemberConfiguration : IEntityTypeConfiguration<InvestigationTeamMember>
{
    public void Configure(EntityTypeBuilder<InvestigationTeamMember> builder)
    {
        builder.ToTable("investigation_team_members");
        builder.HasKey(e => new { e.InvestigationId, e.UserId });
        builder.HasOne(e => e.Investigation).WithMany(i => i.TeamMembers).HasForeignKey(e => e.InvestigationId);
        builder.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
    }
}

public class FiveWhyEntryConfiguration : IEntityTypeConfiguration<FiveWhyEntry>
{
    public void Configure(EntityTypeBuilder<FiveWhyEntry> builder)
    {
        builder.ToTable("five_why_entries");
        builder.HasKey(e => e.Id);
        builder.HasOne(e => e.Investigation).WithMany(i => i.FiveWhyEntries).HasForeignKey(e => e.InvestigationId);
        builder.HasIndex(e => e.InvestigationId);
        builder.HasIndex(e => new { e.InvestigationId, e.Level }).IsUnique();
    }
}

public class ContributingFactorConfiguration : IEntityTypeConfiguration<ContributingFactor>
{
    public void Configure(EntityTypeBuilder<ContributingFactor> builder)
    {
        builder.ToTable("contributing_factors");
        builder.HasKey(e => e.Id);
        builder.HasOne(e => e.Investigation).WithMany(i => i.ContributingFactors).HasForeignKey(e => e.InvestigationId);
        builder.HasOne(e => e.FactorType).WithMany(f => f.ContributingFactors).HasForeignKey(e => e.FactorTypeId);
        builder.HasIndex(e => e.InvestigationId);
        builder.HasIndex(e => e.FactorTypeId);
    }
}

public class WitnessStatementConfiguration : IEntityTypeConfiguration<WitnessStatement>
{
    public void Configure(EntityTypeBuilder<WitnessStatement> builder)
    {
        builder.ToTable("witness_statements");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.WitnessName).HasMaxLength(200);
        builder.Property(e => e.JobTitle).HasMaxLength(200);
        builder.Property(e => e.Employer).HasMaxLength(200);
        builder.Property(e => e.Phone).HasMaxLength(30);
        builder.HasOne(e => e.Investigation).WithMany(i => i.WitnessStatements).HasForeignKey(e => e.InvestigationId);
        builder.HasOne(e => e.CollectedBy).WithMany().HasForeignKey(e => e.CollectedById);
        builder.HasOne(e => e.ReferencesStatement).WithMany().HasForeignKey(e => e.ReferencesStatementId);
        builder.HasIndex(e => e.InvestigationId);
    }
}

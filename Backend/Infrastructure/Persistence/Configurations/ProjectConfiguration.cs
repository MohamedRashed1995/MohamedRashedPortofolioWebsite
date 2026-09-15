using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence.Configurations;

public sealed class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasKey(project => project.Id);
        builder.HasIndex(project => project.Slug).IsUnique();
        builder.Property(project => project.Title).HasMaxLength(160).IsRequired();
        builder.Property(project => project.Slug).HasMaxLength(160).IsRequired();
        builder.Property(project => project.ShortDescription).HasMaxLength(500).IsRequired();
        builder.Property(project => project.Description).IsRequired();
        builder.Property(project => project.Role).HasMaxLength(160).IsRequired();
        builder.HasMany(project => project.ProjectTechnologies).WithOne(link => link.Project).HasForeignKey(link => link.ProjectId);
        builder.HasMany(project => project.Metrics).WithOne(metric => metric.Project).HasForeignKey(metric => metric.ProjectId);
        builder.HasMany(project => project.Endpoints).WithOne(endpoint => endpoint.Project).HasForeignKey(endpoint => endpoint.ProjectId);
        builder.HasMany(project => project.ArchitectureLayers).WithOne(layer => layer.Project).HasForeignKey(layer => layer.ProjectId);
    }
}

public sealed class TechnologyConfiguration : IEntityTypeConfiguration<Technology>
{
    public void Configure(EntityTypeBuilder<Technology> builder)
    {
        builder.HasKey(technology => technology.Id);
        builder.HasIndex(technology => technology.Name).IsUnique();
        builder.Property(technology => technology.Name).HasMaxLength(100).IsRequired();
        builder.Property(technology => technology.Category).HasMaxLength(80).IsRequired();
    }
}

public sealed class ProjectTechnologyConfiguration : IEntityTypeConfiguration<ProjectTechnology>
{
    public void Configure(EntityTypeBuilder<ProjectTechnology> builder) => builder.HasKey(link => new { link.ProjectId, link.TechnologyId });
}

public sealed class InquiryConfiguration : IEntityTypeConfiguration<Inquiry>
{
    public void Configure(EntityTypeBuilder<Inquiry> builder)
    {
        builder.HasKey(inquiry => inquiry.Id);
        builder.HasIndex(inquiry => inquiry.CreatedAt);
        builder.Property(inquiry => inquiry.Name).HasMaxLength(120).IsRequired();
        builder.Property(inquiry => inquiry.Email).HasMaxLength(320).IsRequired();
        builder.Property(inquiry => inquiry.Company).HasMaxLength(160);
        builder.Property(inquiry => inquiry.InquiryType).HasMaxLength(60).IsRequired();
        builder.Property(inquiry => inquiry.Message).HasMaxLength(5000).IsRequired();
        builder.Property(inquiry => inquiry.Status).HasMaxLength(30).IsRequired();
    }
}

public sealed class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    public void Configure(EntityTypeBuilder<AdminUser> builder)
    {
        builder.HasKey(user => user.Id);
        builder.HasIndex(user => user.Email).IsUnique();
        builder.Property(user => user.Email).HasMaxLength(320).IsRequired();
        builder.Property(user => user.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(user => user.Role).HasMaxLength(50).IsRequired();
    }
}

public sealed class AiEvaluationCaseConfiguration : IEntityTypeConfiguration<AiEvaluationCase>
{
    public void Configure(EntityTypeBuilder<AiEvaluationCase> builder)
    {
        builder.HasKey(item => item.Id);
        builder.Property(item => item.Title).HasMaxLength(240).IsRequired();
        builder.Property(item => item.Category).HasMaxLength(80).IsRequired();
        builder.Property(item => item.FlawedResponse).IsRequired();
        builder.Property(item => item.IdentifiedFlaw).IsRequired();
        builder.Property(item => item.CorrectedEvaluation).IsRequired();
        builder.Property(item => item.Takeaway).IsRequired();
    }
}

public sealed class GithubMetricsCacheConfiguration : IEntityTypeConfiguration<GithubMetricsCache>
{
    public void Configure(EntityTypeBuilder<GithubMetricsCache> builder)
    {
        builder.HasKey(item => item.Id);
        builder.Property(item => item.TopLanguagesJson).IsRequired();
        builder.HasIndex(item => item.LastSyncedAt);
    }
}

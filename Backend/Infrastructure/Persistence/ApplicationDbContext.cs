using Microsoft.EntityFrameworkCore;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Technology> Technologies => Set<Technology>();
    public DbSet<ProjectTechnology> ProjectTechnologies => Set<ProjectTechnology>();
    public DbSet<ProjectMetric> ProjectMetrics => Set<ProjectMetric>();
    public DbSet<ProjectEndpoint> ProjectEndpoints => Set<ProjectEndpoint>();
    public DbSet<ArchitectureLayer> ArchitectureLayers => Set<ArchitectureLayer>();
    public DbSet<Inquiry> Inquiries => Set<Inquiry>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<AiEvaluationCase> AiEvaluationCases => Set<AiEvaluationCase>();
    public DbSet<GithubMetricsCache> GithubMetricsCaches => Set<GithubMetricsCache>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}

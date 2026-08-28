using Microsoft.EntityFrameworkCore;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.Infrastructure.Services;

public sealed class ProjectService(ApplicationDbContext db) : IProjectService
{
    public async Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken cancellationToken) =>
        await LoadProjectsAsync(db.Projects.AsNoTracking().OrderByDescending(project => project.Featured).ThenBy(project => project.DisplayOrder), cancellationToken);

    public async Task<ProjectDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return (await LoadProjectsAsync(db.Projects.AsNoTracking().Where(project => project.Slug == slug), cancellationToken)).SingleOrDefault();
    }

    private async Task<IReadOnlyList<ProjectDto>> LoadProjectsAsync(IQueryable<Portfolio.Domain.Entities.Project> query, CancellationToken cancellationToken)
    {
        var projects = await query.Include(project => project.ProjectTechnologies).ThenInclude(link => link.Technology).Include(project => project.Metrics).Include(project => project.Endpoints).Include(project => project.ArchitectureLayers).ToListAsync(cancellationToken);
        return projects.Select(ToDto).ToList();
    }

    private static ProjectDto ToDto(Portfolio.Domain.Entities.Project project) => new(
        project.Id, project.Title, project.Slug, project.ShortDescription, project.Description, project.Role, project.Featured, "", null, "",
        project.ProjectTechnologies.Select(item => item.Technology.Name).ToList(),
        project.Metrics.OrderBy(item => item.DisplayOrder).Select(item => new ProjectMetricDto(item.MetricName, item.MetricValue)).ToList(),
        project.Endpoints.Where(item => item.IsPublicDemo).Select(item => new ProjectEndpointDto(item.HttpMethod, item.Route, item.Description, item.AuthenticationRequired, item.IsPublicDemo, new { data = Array.Empty<object>(), total = 0 })).ToList(),
        project.ArchitectureLayers.OrderBy(item => item.DisplayOrder).Select(item => new ArchitectureLayerDto(item.Name, item.Description, item.Responsibilities.Split("\n", StringSplitOptions.RemoveEmptyEntries))).ToList(),
        []);
}

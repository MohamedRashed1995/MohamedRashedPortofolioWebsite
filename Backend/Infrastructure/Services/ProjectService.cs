using Microsoft.EntityFrameworkCore;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Entities;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.Infrastructure.Services;

public sealed class ProjectService(ApplicationDbContext db) : IProjectService
{
    public async Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken ct) =>
        await LoadProjectsAsync(
            db.Projects.AsNoTracking()
                .OrderByDescending(p => p.Featured)
                .ThenBy(p => p.DisplayOrder), ct);

    public async Task<ProjectDto?> GetBySlugAsync(string slug, CancellationToken ct) =>
        (await LoadProjectsAsync(db.Projects.AsNoTracking().Where(p => p.Slug == slug), ct))
            .SingleOrDefault();

    public async Task<ProjectDto> CreateAsync(CreateProjectDto input, CancellationToken ct)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = input.Title.Trim(),
            Slug = input.Slug.Trim().ToLowerInvariant(),
            ShortDescription = input.ShortDescription.Trim(),
            Description = input.Description.Trim(),
            Role = input.Role.Trim(),
            Featured = input.Featured,
            DisplayOrder = input.DisplayOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await AttachRelatedForCreateAsync(project, input.TechnologyNames, input.Metrics, input.Endpoints, input.ArchitectureLayers, ct);

        db.Projects.Add(project);
        await db.SaveChangesAsync(ct);
        return (await GetDtoByIdAsync(project.Id, ct))!;
    }

    public async Task<ProjectDto?> UpdateAsync(Guid id, UpdateProjectDto input, CancellationToken ct)
    {
        var project = await db.Projects
            .Include(p => p.ProjectTechnologies)
                .ThenInclude(pt => pt.Technology)
            .Include(p => p.Metrics)
            .Include(p => p.Endpoints)
            .Include(p => p.ArchitectureLayers)
            .SingleOrDefaultAsync(p => p.Id == id, ct);

        if (project is null) return null;

        if (input.TechnologyNames is not null)
            await SyncTechnologiesAsync(project, input.TechnologyNames, ct);

        if (input.Metrics is not null)
            SyncMetrics(project, input.Metrics);

        if (input.Endpoints is not null)
            SyncEndpoints(project, input.Endpoints);

        if (input.ArchitectureLayers is not null)
            SyncLayers(project, input.ArchitectureLayers);

        project.Title = input.Title.Trim();
        project.ShortDescription = input.ShortDescription.Trim();
        project.Description = input.Description.Trim();
        project.Role = input.Role.Trim();
        project.Featured = input.Featured;
        project.DisplayOrder = input.DisplayOrder;
        project.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return await GetDtoByIdAsync(project.Id, ct);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var project = await db.Projects.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (project is null) return false;
        db.Projects.Remove(project);
        await db.SaveChangesAsync(ct);
        return true;
    }

    // ──────────────────────────────────────────────────────────────
    // Private synchronization helpers — update tracked children in memory
    // ──────────────────────────────────────────────────────────────

    private async Task SyncTechnologiesAsync(
        Project project,
        IReadOnlyList<string> incoming,
        CancellationToken ct)
    {
        var names = incoming
            .Select(n => n.Trim())
            .Where(n => n.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var incomingNames = names
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var obsoleteLinks = project.ProjectTechnologies
            .Where(pt => !incomingNames.Contains(pt.Technology.Name))
            .ToList();

        foreach (var link in obsoleteLinks)
            db.ProjectTechnologies.Remove(link);

        var existingNames = project.ProjectTechnologies
            .Where(pt => db.Entry(pt).State != EntityState.Deleted)
            .Select(pt => pt.Technology.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var namesToAdd = names.Where(name => !existingNames.Contains(name)).ToList();
        if (namesToAdd.Count == 0)
            return;

        var existingTechnologies = await db.Technologies
            .Where(t => namesToAdd.Contains(t.Name))
            .ToListAsync(ct);

        foreach (var name in namesToAdd)
        {
            var technology = existingTechnologies.FirstOrDefault(t =>
                string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase));

            if (technology is null)
            {
                technology = new Technology
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    Category = "General"
                };
                db.Technologies.Add(technology);
                existingTechnologies.Add(technology);
            }

            db.ProjectTechnologies.Add(new ProjectTechnology
            {
                ProjectId = project.Id,
                Project = project,
                TechnologyId = technology.Id,
                Technology = technology
            });
        }
    }

    private void SyncMetrics(Project project, IReadOnlyList<CreateProjectMetricDto> incoming)
    {
        var incomingNames = incoming
            .Select(metric => metric.MetricName.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var obsoleteMetrics = project.Metrics
            .Where(metric => !incomingNames.Contains(metric.MetricName))
            .ToList();

        foreach (var metric in obsoleteMetrics)
            db.ProjectMetrics.Remove(metric);

        foreach (var dto in incoming)
        {
            var name = dto.MetricName.Trim();
            var existing = project.Metrics.FirstOrDefault(metric =>
                db.Entry(metric).State != EntityState.Deleted &&
                string.Equals(metric.MetricName, name, StringComparison.OrdinalIgnoreCase));

            if (existing is not null)
            {
                existing.MetricValue = dto.MetricValue.Trim();
                existing.DisplayOrder = dto.DisplayOrder;
                continue;
            }

            db.ProjectMetrics.Add(new ProjectMetric
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Project = project,
                MetricName = name,
                MetricValue = dto.MetricValue.Trim(),
                DisplayOrder = dto.DisplayOrder
            });
        }
    }

    private void SyncEndpoints(Project project, IReadOnlyList<CreateProjectEndpointDto> incoming)
    {
        var incomingKeys = incoming
            .Select(dto => GetEndpointKey(dto.HttpMethod, dto.Route))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var obsoleteEndpoints = project.Endpoints
            .Where(endpoint => !incomingKeys.Contains(GetEndpointKey(endpoint.HttpMethod, endpoint.Route)))
            .ToList();

        foreach (var endpoint in obsoleteEndpoints)
            db.ProjectEndpoints.Remove(endpoint);

        foreach (var dto in incoming)
        {
            var method = dto.HttpMethod.Trim().ToUpperInvariant();
            var route = dto.Route.Trim();
            var existing = project.Endpoints.FirstOrDefault(endpoint =>
                db.Entry(endpoint).State != EntityState.Deleted &&
                string.Equals(endpoint.HttpMethod, method, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(endpoint.Route, route, StringComparison.OrdinalIgnoreCase));

            if (existing is not null)
            {
                existing.Description = dto.Description.Trim();
                existing.AuthenticationRequired = dto.AuthenticationRequired;
                existing.IsPublicDemo = dto.IsPublicDemo;
                continue;
            }

            db.ProjectEndpoints.Add(new ProjectEndpoint
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Project = project,
                HttpMethod = method,
                Route = route,
                Description = dto.Description.Trim(),
                AuthenticationRequired = dto.AuthenticationRequired,
                IsPublicDemo = dto.IsPublicDemo
            });
        }
    }

    private void SyncLayers(Project project, IReadOnlyList<CreateArchitectureLayerDto> incoming)
    {
        var incomingNames = incoming
            .Select(layer => layer.Name.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var obsoleteLayers = project.ArchitectureLayers
            .Where(layer => !incomingNames.Contains(layer.Name))
            .ToList();

        foreach (var layer in obsoleteLayers)
            db.ArchitectureLayers.Remove(layer);

        foreach (var dto in incoming)
        {
            var name = dto.Name.Trim();
            var existing = project.ArchitectureLayers.FirstOrDefault(layer =>
                db.Entry(layer).State != EntityState.Deleted &&
                string.Equals(layer.Name, name, StringComparison.OrdinalIgnoreCase));

            if (existing is not null)
            {
                existing.Description = dto.Description.Trim();
                existing.Responsibilities = dto.Responsibilities.Trim();
                existing.DisplayOrder = dto.DisplayOrder;
                continue;
            }

            db.ArchitectureLayers.Add(new ArchitectureLayer
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Project = project,
                Name = name,
                Description = dto.Description.Trim(),
                Responsibilities = dto.Responsibilities.Trim(),
                DisplayOrder = dto.DisplayOrder
            });
        }
    }

    private static string GetEndpointKey(string httpMethod, string route) =>
        $"{httpMethod.Trim().ToUpperInvariant()}::{route.Trim()}";

    private async Task AttachRelatedForCreateAsync(
        Project project,
        IReadOnlyList<string> technologyNames,
        IReadOnlyList<CreateProjectMetricDto> metrics,
        IReadOnlyList<CreateProjectEndpointDto> endpoints,
        IReadOnlyList<CreateArchitectureLayerDto> layers,
        CancellationToken ct)
    {
        var names = technologyNames
            .Select(n => n.Trim())
            .Where(n => n.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (names.Count > 0)
        {
            var existing = await db.Technologies
                .Where(t => names.Contains(t.Name))
                .ToListAsync(ct);

            foreach (var name in names)
            {
                var tech = existing.FirstOrDefault(t =>
                    string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase));
                if (tech is null)
                {
                    tech = new Technology { Id = Guid.NewGuid(), Name = name, Category = "General" };
                    db.Technologies.Add(tech);
                    existing.Add(tech);
                }
                project.ProjectTechnologies.Add(new ProjectTechnology
                {
                    ProjectId = project.Id,
                    TechnologyId = tech.Id,
                    Technology = tech,
                    Project = project
                });
            }
        }

        foreach (var m in metrics)
            project.Metrics.Add(new ProjectMetric
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                MetricName = m.MetricName.Trim(),
                MetricValue = m.MetricValue.Trim(),
                DisplayOrder = m.DisplayOrder,
                Project = project
            });

        foreach (var e in endpoints)
            project.Endpoints.Add(new ProjectEndpoint
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                HttpMethod = e.HttpMethod.Trim().ToUpperInvariant(),
                Route = e.Route.Trim(),
                Description = e.Description.Trim(),
                AuthenticationRequired = e.AuthenticationRequired,
                IsPublicDemo = e.IsPublicDemo,
                Project = project
            });

        foreach (var l in layers)
            project.ArchitectureLayers.Add(new ArchitectureLayer
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Name = l.Name.Trim(),
                Description = l.Description.Trim(),
                Responsibilities = l.Responsibilities.Trim(),
                DisplayOrder = l.DisplayOrder,
                Project = project
            });
    }

    private async Task<ProjectDto?> GetDtoByIdAsync(Guid id, CancellationToken ct) =>
        (await LoadProjectsAsync(db.Projects.AsNoTracking().Where(p => p.Id == id), ct))
            .SingleOrDefault();

    private async Task<IReadOnlyList<ProjectDto>> LoadProjectsAsync(IQueryable<Project> query, CancellationToken ct)
    {
        var projects = await query
            .Include(p => p.ProjectTechnologies).ThenInclude(link => link.Technology)
            .Include(p => p.Metrics)
            .Include(p => p.Endpoints)
            .Include(p => p.ArchitectureLayers)
            .ToListAsync(ct);
        return projects.Select(ToDto).ToList();
    }

    private static ProjectDto ToDto(Project project) => new(
        project.Id,
        project.Title,
        project.Slug,
        project.ShortDescription,
        project.Description,
        project.Role,
        project.Featured,
        "", null, "",
        project.ProjectTechnologies.Select(i => i.Technology.Name).ToList(),
        project.Metrics.OrderBy(i => i.DisplayOrder)
            .Select(i => new ProjectMetricDto(i.MetricName, i.MetricValue)).ToList(),
        project.Endpoints.Where(i => i.IsPublicDemo)
            .Select(i => new ProjectEndpointDto(
                i.HttpMethod, i.Route, i.Description, i.AuthenticationRequired, i.IsPublicDemo,
                new { data = Array.Empty<object>(), total = 0 })).ToList(),
        project.ArchitectureLayers.OrderBy(i => i.DisplayOrder)
            .Select(i => new ArchitectureLayerDto(
                i.Name, i.Description,
                i.Responsibilities.Split("\n", StringSplitOptions.RemoveEmptyEntries))).ToList(),
        []);
}

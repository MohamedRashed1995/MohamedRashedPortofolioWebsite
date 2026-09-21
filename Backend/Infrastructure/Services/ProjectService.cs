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

        // ── Phase 1: collect and flush deletions ──────────────────────────────
        bool hasRemovals = false;

        if (input.TechnologyNames is not null)
            hasRemovals |= RemoveObsoleteTechnologies(project, input.TechnologyNames);

        if (input.Metrics is not null)
            hasRemovals |= RemoveObsoleteMetrics(project, input.Metrics);

        if (input.Endpoints is not null)
            hasRemovals |= RemoveObsoleteEndpoints(project, input.Endpoints);

        if (input.ArchitectureLayers is not null)
            hasRemovals |= RemoveObsoleteLayers(project, input.ArchitectureLayers);

        // Flush deletions first so the InMemory store sees them before inserts
        if (hasRemovals)
            await db.SaveChangesAsync(ct);

        // ── Phase 2: update scalars + add new children ────────────────────────
        project.Title = input.Title.Trim();
        project.ShortDescription = input.ShortDescription.Trim();
        project.Description = input.Description.Trim();
        project.Role = input.Role.Trim();
        project.Featured = input.Featured;
        project.DisplayOrder = input.DisplayOrder;
        project.UpdatedAt = DateTime.UtcNow;

        if (input.TechnologyNames is not null)
            await AddNewTechnologiesAsync(project, input.TechnologyNames, ct);

        if (input.Metrics is not null)
            AddOrUpdateMetrics(project, input.Metrics);

        if (input.Endpoints is not null)
            AddOrUpdateEndpoints(project, input.Endpoints);

        if (input.ArchitectureLayers is not null)
            AddOrUpdateLayers(project, input.ArchitectureLayers);

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
    // Private synchronization helpers — Phase 1: remove obsolete
    // ──────────────────────────────────────────────────────────────

    private bool RemoveObsoleteTechnologies(Project project, IReadOnlyList<string> incoming)
    {
        var names = incoming.Select(n => n.Trim()).Where(n => n.Length > 0)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var toRemove = project.ProjectTechnologies
            .Where(pt => !names.Contains(pt.Technology.Name))
            .ToList();
        foreach (var link in toRemove)
        {
            project.ProjectTechnologies.Remove(link);
            db.Entry(link).State = EntityState.Deleted;
        }
        return toRemove.Count > 0;
    }

    private bool RemoveObsoleteMetrics(Project project, IReadOnlyList<CreateProjectMetricDto> incoming)
    {
        var names = incoming.Select(m => m.MetricName.Trim()).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var toRemove = project.Metrics.Where(m => !names.Contains(m.MetricName)).ToList();
        foreach (var m in toRemove)
        {
            project.Metrics.Remove(m);
            db.Entry(m).State = EntityState.Deleted;
        }
        return toRemove.Count > 0;
    }

    private bool RemoveObsoleteEndpoints(Project project, IReadOnlyList<CreateProjectEndpointDto> incoming)
    {
        var toRemove = project.Endpoints
            .Where(e => !incoming.Any(dto =>
                string.Equals(dto.HttpMethod.Trim(), e.HttpMethod, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(dto.Route.Trim(), e.Route, StringComparison.OrdinalIgnoreCase)))
            .ToList();
        foreach (var e in toRemove)
        {
            project.Endpoints.Remove(e);
            db.Entry(e).State = EntityState.Deleted;
        }
        return toRemove.Count > 0;
    }

    private bool RemoveObsoleteLayers(Project project, IReadOnlyList<CreateArchitectureLayerDto> incoming)
    {
        var names = incoming.Select(l => l.Name.Trim()).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var toRemove = project.ArchitectureLayers.Where(l => !names.Contains(l.Name)).ToList();
        foreach (var l in toRemove)
        {
            project.ArchitectureLayers.Remove(l);
            db.Entry(l).State = EntityState.Deleted;
        }
        return toRemove.Count > 0;
    }

    // ──────────────────────────────────────────────────────────────
    // Private synchronization helpers — Phase 2: add or update
    // ──────────────────────────────────────────────────────────────

    private async Task AddNewTechnologiesAsync(
        Project project,
        IReadOnlyList<string> incoming,
        CancellationToken ct)
    {
        var names = incoming
            .Select(n => n.Trim())
            .Where(n => n.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var existingNames = project.ProjectTechnologies
            .Select(pt => pt.Technology.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var namesToAdd = names.Where(n => !existingNames.Contains(n)).ToList();

        if (namesToAdd.Count > 0)
        {
            var dbTechs = await db.Technologies
                .Where(t => namesToAdd.Contains(t.Name))
                .ToListAsync(ct);

            foreach (var name in namesToAdd)
            {
                var tech = dbTechs.FirstOrDefault(t =>
                    string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase));

                if (tech is null)
                {
                    tech = new Technology { Id = Guid.NewGuid(), Name = name, Category = "General" };
                    db.Technologies.Add(tech);
                    dbTechs.Add(tech);
                }

                db.ProjectTechnologies.Add(new ProjectTechnology
                {
                    ProjectId = project.Id,
                    TechnologyId = tech.Id
                });
            }
        }
    }

    private void AddOrUpdateMetrics(Project project, IReadOnlyList<CreateProjectMetricDto> incoming)
    {
        foreach (var dto in incoming)
        {
            var name = dto.MetricName.Trim();
            var existing = project.Metrics.FirstOrDefault(m =>
                string.Equals(m.MetricName, name, StringComparison.OrdinalIgnoreCase));

            if (existing is not null)
            {
                existing.MetricValue = dto.MetricValue.Trim();
                existing.DisplayOrder = dto.DisplayOrder;
            }
            else
            {
                db.ProjectMetrics.Add(new ProjectMetric
                {
                    Id = Guid.NewGuid(),
                    ProjectId = project.Id,
                    MetricName = name,
                    MetricValue = dto.MetricValue.Trim(),
                    DisplayOrder = dto.DisplayOrder
                });
            }
        }
    }

    private void AddOrUpdateEndpoints(Project project, IReadOnlyList<CreateProjectEndpointDto> incoming)
    {
        foreach (var dto in incoming)
        {
            var method = dto.HttpMethod.Trim().ToUpperInvariant();
            var route = dto.Route.Trim();
            var existing = project.Endpoints.FirstOrDefault(e =>
                string.Equals(e.HttpMethod, method, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(e.Route, route, StringComparison.OrdinalIgnoreCase));

            if (existing is not null)
            {
                existing.Description = dto.Description.Trim();
                existing.AuthenticationRequired = dto.AuthenticationRequired;
                existing.IsPublicDemo = dto.IsPublicDemo;
            }
            else
            {
                db.ProjectEndpoints.Add(new ProjectEndpoint
                {
                    Id = Guid.NewGuid(),
                    ProjectId = project.Id,
                    HttpMethod = method,
                    Route = route,
                    Description = dto.Description.Trim(),
                    AuthenticationRequired = dto.AuthenticationRequired,
                    IsPublicDemo = dto.IsPublicDemo
                });
            }
        }
    }

    private void AddOrUpdateLayers(Project project, IReadOnlyList<CreateArchitectureLayerDto> incoming)
    {
        foreach (var dto in incoming)
        {
            var name = dto.Name.Trim();
            var existing = project.ArchitectureLayers.FirstOrDefault(l =>
                string.Equals(l.Name, name, StringComparison.OrdinalIgnoreCase));

            if (existing is not null)
            {
                existing.Description = dto.Description.Trim();
                existing.Responsibilities = dto.Responsibilities.Trim();
                existing.DisplayOrder = dto.DisplayOrder;
            }
            else
            {
                db.ArchitectureLayers.Add(new ArchitectureLayer
                {
                    Id = Guid.NewGuid(),
                    ProjectId = project.Id,
                    Name = name,
                    Description = dto.Description.Trim(),
                    Responsibilities = dto.Responsibilities.Trim(),
                    DisplayOrder = dto.DisplayOrder
                });
            }
        }
    }

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

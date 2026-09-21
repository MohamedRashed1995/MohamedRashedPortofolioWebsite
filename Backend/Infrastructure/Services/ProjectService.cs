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

        await AttachRelatedAsync(project, input.TechnologyNames, input.Metrics, input.Endpoints, input.ArchitectureLayers, ct);

        db.Projects.Add(project);
        await db.SaveChangesAsync(ct);
        return (await GetDtoByIdAsync(project.Id, ct))!;
    }

    public async Task<ProjectDto?> UpdateAsync(Guid id, UpdateProjectDto input, CancellationToken ct)
{
    var project = await db.Projects
        .Include(p => p.ProjectTechnologies)
        .Include(p => p.Metrics)
        .Include(p => p.Endpoints)
        .Include(p => p.ArchitectureLayers)
        .SingleOrDefaultAsync(p => p.Id == id, ct);

    if (project is null) return null;

    project.Title = input.Title.Trim();
    // ملاحظة: إذا كان الـ UpdateProjectDto لا يحتوي على Slug، تجنب الكتابة فوقه أو اجعله مُحدثاً إذا كان مرسلاً
    project.ShortDescription = input.ShortDescription.Trim();
    project.Description = input.Description.Trim();
    project.Role = input.Role.Trim();
    project.Featured = input.Featured;
    project.DisplayOrder = input.DisplayOrder;
    project.UpdatedAt = DateTime.UtcNow;

    // مسح العلاقات القديمة بطريقة آمنة
    db.ProjectTechnologies.RemoveRange(project.ProjectTechnologies);
    db.ProjectMetrics.RemoveRange(project.Metrics);
    db.ProjectEndpoints.RemoveRange(project.Endpoints);
    db.ArchitectureLayers.RemoveRange(project.ArchitectureLayers);
    
    // حفظ التغييرات المؤقتة لحذف العناصر القديمة من قاعدة البيانات أولاً ومنع تداخل الـ Tracking
    await db.SaveChangesAsync(ct);

    project.ProjectTechnologies.Clear();
    project.Metrics.Clear();
    project.Endpoints.Clear();
    project.ArchitectureLayers.Clear();

    // ربط العناصر الجديدة
    await AttachRelatedAsync(project, input.TechnologyNames, input.Metrics, input.Endpoints, input.ArchitectureLayers, ct);

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

    private async Task<ProjectDto?> GetDtoByIdAsync(Guid id, CancellationToken ct) =>
        (await LoadProjectsAsync(db.Projects.AsNoTracking().Where(p => p.Id == id), ct))
            .SingleOrDefault();

    private async Task AttachRelatedAsync(
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
                HttpMethod = e.HttpMethod.Trim(),
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

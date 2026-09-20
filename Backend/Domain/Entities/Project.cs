namespace Portfolio.Domain.Entities;

public sealed class Project
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string ShortDescription { get; set; }
    public required string Description { get; set; }
    public required string Role { get; set; }
    public bool Featured { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<ProjectTechnology> ProjectTechnologies { get; set; } = [];
    public ICollection<ProjectMetric> Metrics { get; set; } = [];
    public ICollection<ProjectEndpoint> Endpoints { get; set; } = [];
    public ICollection<ArchitectureLayer> ArchitectureLayers { get; set; } = [];
}

public sealed class Technology
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public ICollection<ProjectTechnology> ProjectTechnologies { get; set; } = [];
}

public sealed class ProjectTechnology
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid TechnologyId { get; set; }
    public Technology Technology { get; set; } = null!;
}

public sealed class ProjectMetric
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public required string MetricName { get; set; }
    public required string MetricValue { get; set; }
    public int DisplayOrder { get; set; }
}

public sealed class ProjectEndpoint
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public required string HttpMethod { get; set; }
    public required string Route { get; set; }
    public required string Description { get; set; }
    public bool AuthenticationRequired { get; set; }
    public bool IsPublicDemo { get; set; }
}

public sealed class ArchitectureLayer
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Responsibilities { get; set; }
    public int DisplayOrder { get; set; }
}

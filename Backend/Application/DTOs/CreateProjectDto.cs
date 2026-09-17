namespace Portfolio.Application.DTOs;

public sealed record CreateProjectDto(
    string Title,
    string Slug,
    string ShortDescription,
    string Description,
    string Role,
    bool Featured,
    int DisplayOrder,
    IReadOnlyList<string> TechnologyNames,
    IReadOnlyList<CreateProjectMetricDto> Metrics,
    IReadOnlyList<CreateProjectEndpointDto> Endpoints,
    IReadOnlyList<CreateArchitectureLayerDto> ArchitectureLayers
);

public sealed record CreateProjectMetricDto(string MetricName, string MetricValue, int DisplayOrder);
public sealed record CreateProjectEndpointDto(string HttpMethod, string Route, string Description, bool AuthenticationRequired, bool IsPublicDemo);
public sealed record CreateArchitectureLayerDto(string Name, string Description, string Responsibilities, int DisplayOrder);
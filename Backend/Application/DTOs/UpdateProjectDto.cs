namespace Portfolio.Application.DTOs;

public sealed record UpdateProjectDto(
    string Title,
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
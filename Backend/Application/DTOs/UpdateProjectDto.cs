using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace Portfolio.Application.DTOs;

public sealed class UpdateProjectDto
{
    [Required]
    [StringLength(160, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(500, MinimumLength = 1)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(160, MinimumLength = 1)]
    public string Role { get; set; } = string.Empty;

    public bool Featured { get; set; }

    public int DisplayOrder { get; set; }

    // null = preserve, [] = clear, [...] = synchronize
    public IReadOnlyList<string>? TechnologyNames { get; set; }

    [ValidateNever]
    public IReadOnlyList<CreateProjectMetricDto>? Metrics { get; set; }

    [ValidateNever]
    public IReadOnlyList<CreateProjectEndpointDto>? Endpoints { get; set; }

    [ValidateNever]
    public IReadOnlyList<CreateArchitectureLayerDto>? ArchitectureLayers { get; set; }
}

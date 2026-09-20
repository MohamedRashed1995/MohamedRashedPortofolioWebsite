using System.ComponentModel.DataAnnotations;

namespace Portfolio.Application.DTOs;

public sealed record ProjectDto(
    Guid Id,
    string Title,
    string Slug,
    string ShortDescription,
    string Description,
    string Role,
    bool Featured,
    string Period,
    string? RepoUrl,
    string ThumbnailColor,
    IReadOnlyList<string> Technologies,
    IReadOnlyList<ProjectMetricDto> Metrics,
    IReadOnlyList<ProjectEndpointDto> Endpoints,
    IReadOnlyList<ArchitectureLayerDto> ArchitectureLayers,
    IReadOnlyList<SchemaTableDto> SchemaTables);

public sealed record ProjectMetricDto(string Label, string Value);
public sealed record ProjectEndpointDto(string Method, string Path, string Description, bool AuthenticationRequired, bool IsPublicDemo, object SampleResponse);
public sealed record ArchitectureLayerDto(string Name, string Description, IReadOnlyList<string> Responsibilities);
public sealed record SchemaTableDto(string Name, IReadOnlyList<SchemaColumnDto> Columns, IReadOnlyList<SchemaRelationshipDto> Relationships);
public sealed record SchemaColumnDto(string Name, string Type, bool IsPrimaryKey, bool IsForeignKey, bool IsNullable);
public sealed record SchemaRelationshipDto(string FromTable, string FromColumn, string ToTable, string ToColumn);

public sealed class InquiryCreateDto
{
    [Required, StringLength(120)] public string Name { get; init; } = string.Empty;
    [Required, EmailAddress, StringLength(320)] public string Email { get; init; } = string.Empty;
    [StringLength(160)] public string? Company { get; init; }
    [Required] public string InquiryType { get; init; } = string.Empty;
    [Required, MinLength(10), MaxLength(5000)] public string Message { get; init; } = string.Empty;
}

public sealed record InquiryCreatedDto(Guid Id, string Status, DateTime CreatedAt);
public sealed record InquiryDto(Guid Id, string Name, string Email, string? Company, string InquiryType, string Message, string Status, DateTime CreatedAt);

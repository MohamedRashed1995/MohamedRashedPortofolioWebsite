using Portfolio.Application.DTOs;

namespace Portfolio.Application.Interfaces;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<ProjectDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<ProjectDto> CreateAsync(CreateProjectDto input, CancellationToken cancellationToken);
    Task<ProjectDto?> UpdateAsync(Guid id, UpdateProjectDto input, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
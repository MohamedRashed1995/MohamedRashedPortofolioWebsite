using Portfolio.Application.DTOs;

namespace Portfolio.Application.Interfaces;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<ProjectDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
}

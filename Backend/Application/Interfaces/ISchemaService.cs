using Portfolio.Application.DTOs;

namespace Portfolio.Application.Interfaces;

public interface ISchemaService
{
    Task<IReadOnlyList<SchemaTableDto>?> GetForProjectAsync(string slug, CancellationToken cancellationToken);
}

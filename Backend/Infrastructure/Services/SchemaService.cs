using Microsoft.EntityFrameworkCore;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.Infrastructure.Services;

public sealed class SchemaService(ApplicationDbContext db) : ISchemaService
{
    public async Task<IReadOnlyList<SchemaTableDto>?> GetForProjectAsync(string slug, CancellationToken cancellationToken)
    {
        if (!await db.Projects.AsNoTracking().AnyAsync(project => project.Slug == slug, cancellationToken)) return null;
        return db.Model.GetEntityTypes().Where(entity => entity.GetTableName() is not null).Select(entity => new SchemaTableDto(
            entity.GetTableName()!,
            entity.GetProperties().Select(property => new SchemaColumnDto(property.Name, property.GetColumnType() ?? property.ClrType.Name, entity.FindPrimaryKey()?.Properties.Contains(property) == true, entity.GetForeignKeys().Any(foreignKey => foreignKey.Properties.Contains(property)), property.IsNullable)).ToList(),
            entity.GetForeignKeys().SelectMany(foreignKey => foreignKey.Properties.Select(property => new SchemaRelationshipDto(entity.GetTableName()!, property.Name, foreignKey.PrincipalEntityType.GetTableName()!, foreignKey.PrincipalKey.Properties.First().Name))).ToList())).ToList();
    }
}

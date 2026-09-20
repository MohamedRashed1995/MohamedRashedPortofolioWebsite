using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/projects/{slug}/schema")]
public sealed class SchemaController(ISchemaService schema) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SchemaTableDto>>> GetSchema(string slug, CancellationToken cancellationToken)
    {
        var tables = await schema.GetForProjectAsync(slug, cancellationToken);
        return tables is null ? NotFound(new { success = false, message = "Project not found." }) : Ok(tables);
    }
}

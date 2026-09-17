using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/projects")]
public sealed class ProjectsController(IProjectService projects) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await projects.GetAllAsync(ct));

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var project = await projects.GetBySlugAsync(slug, ct);
        return project is null
            ? NotFound(new { success = false, message = "Project not found." })
            : Ok(project);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto input, CancellationToken ct)
    {
        var created = await projects.CreateAsync(input, ct);
        return CreatedAtAction(nameof(GetBySlug), new { slug = created.Slug }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto input, CancellationToken ct)
    {
        var updated = await projects.UpdateAsync(id, input, ct);
        return updated is null
            ? NotFound(new { success = false, message = "Project not found." })
            : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var ok = await projects.DeleteAsync(id, ct);
        return ok
            ? NoContent()
            : NotFound(new { success = false, message = "Project not found." });
    }
}
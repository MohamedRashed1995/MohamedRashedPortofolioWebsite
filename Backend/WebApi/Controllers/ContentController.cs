using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Application.DTOs;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1")]
public sealed class ContentController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet("technologies")]
    public async Task<ActionResult<IReadOnlyList<TechnologyDto>>> Technologies(CancellationToken cancellationToken) => Ok(await db.Technologies.AsNoTracking().OrderBy(item => item.Category).ThenBy(item => item.Name).Select(item => new TechnologyDto(item.Id, item.Name, item.Category, item.Icon, item.Description)).ToListAsync(cancellationToken));

    [HttpGet("ai/cases")]
    public async Task<ActionResult<IReadOnlyList<AiEvaluationCaseDto>>> AiCases(CancellationToken cancellationToken) => Ok(await db.AiEvaluationCases.AsNoTracking().OrderBy(item => item.CreatedAt).Select(item => new AiEvaluationCaseDto(item.Id, item.Title, item.Category, item.FlawedResponse, item.IdentifiedFlaw, item.CorrectedEvaluation, item.Takeaway)).ToListAsync(cancellationToken));

    [HttpGet("github/metrics")]
    public async Task<ActionResult<GithubMetricsDto>> GithubMetrics(CancellationToken cancellationToken)
    {
        var cache = await db.GithubMetricsCaches.AsNoTracking().OrderByDescending(item => item.LastSyncedAt).FirstOrDefaultAsync(cancellationToken);
        if (cache is null) return NotFound(new { success = false, message = "GitHub metrics are not synchronized yet." });
        var languages = JsonSerializer.Deserialize<IReadOnlyList<GithubLanguageDto>>(cache.TopLanguagesJson) ?? [];
        return Ok(new GithubMetricsDto(cache.TotalRepos, languages, cache.TotalCommitsLast90Days, cache.LastSyncedAt));
    }
}

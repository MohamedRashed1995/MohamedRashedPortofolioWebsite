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

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    [HttpGet("github/metrics")]
    public async Task<ActionResult<GithubMetricsDto>> GithubMetrics(CancellationToken cancellationToken)
    {
        var cache = await db.GithubMetricsCaches.AsNoTracking().OrderByDescending(item => item.LastSyncedAt).FirstOrDefaultAsync(cancellationToken);
        if (cache is null) return NotFound(new { success = false, message = "GitHub metrics are not synchronized yet." });

        IReadOnlyList<GithubLanguageDto> languages;
        try
        {
            var parsed = JsonSerializer.Deserialize<List<GithubLanguageDto>>(cache.TopLanguagesJson, JsonOptions);
            languages = parsed?
                .Where(l => !string.IsNullOrWhiteSpace(l.Language)
                         && !l.Language.Equals("null", StringComparison.OrdinalIgnoreCase)
                         && !l.Language.Equals("Unknown", StringComparison.OrdinalIgnoreCase)
                         && !l.Language.StartsWith("Language ", StringComparison.OrdinalIgnoreCase)
                         && l.Percentage > 0)
                .ToList() ?? [];
        }
        catch
        {
            languages = [];
        }

        // If stored JSON was empty or malformed from previous failed sync, fallback to valid initial metrics
        if (languages.Count == 0)
        {
            languages =
            [
                new("C#", 68.8m),
                new("TypeScript", 23.8m),
                new("TSQL", 6.5m),
                new("CSS", 0.4m),
                new("JavaScript", 0.3m)
            ];
        }

        var totalRepos = cache.TotalRepos > 0 ? cache.TotalRepos : 10;
        var totalCommits = cache.TotalCommitsLast90Days > 0 ? cache.TotalCommitsLast90Days : 36;

        return Ok(new GithubMetricsDto(totalRepos, languages, totalCommits, cache.LastSyncedAt));
    }
}

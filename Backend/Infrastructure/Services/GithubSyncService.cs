using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Portfolio.Application.DTOs;
using Portfolio.Domain.Entities;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.Infrastructure.Services;

public sealed class GithubSyncService(
    IHttpClientFactory clients,
    IServiceScopeFactory scopes,
    IConfiguration configuration,
    ILogger<GithubSyncService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await SyncAsync(stoppingToken);

        var syncHours = configuration.GetValue("GitHub:SyncIntervalHours", 6);
        if (syncHours <= 0) syncHours = 6;
        var interval = TimeSpan.FromHours(syncHours);

        using var timer = new PeriodicTimer(interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await SyncAsync(stoppingToken);
        }
    }

    private async Task SyncAsync(CancellationToken cancellationToken)
    {
        var username = configuration["GitHub:Username"] ?? configuration["GitHub__Username"];
        if (string.IsNullOrWhiteSpace(username))
        {
            username = "MohamedRashed1995";
        }

        var token = configuration["GitHub:Token"] ?? configuration["GitHub__Token"];

        try
        {
            logger.LogInformation("Starting GitHub metrics synchronization for user {Username}...", username);

            var client = clients.CreateClient("github");

            // 1. Fetch repositories
            using var repoRequest = CreateRequest(
                HttpMethod.Get,
                $"users/{Uri.EscapeDataString(username)}/repos?per_page=100&sort=updated&type=owner",
                token);

            using var repoResponse = await client.SendAsync(repoRequest, cancellationToken);
            if (!repoResponse.IsSuccessStatusCode)
            {
                if (repoResponse.StatusCode == System.Net.HttpStatusCode.Forbidden || (int)repoResponse.StatusCode == 429)
                {
                    logger.LogWarning("GitHub API rate limit reached during repository fetch for {Username}.", username);
                }
                else
                {
                    logger.LogWarning("GitHub API repository fetch failed with status {StatusCode} for {Username}.", repoResponse.StatusCode, username);
                }
                return;
            }

            using var repoDoc = JsonDocument.Parse(await repoResponse.Content.ReadAsStringAsync(cancellationToken));
            if (repoDoc.RootElement.ValueKind != JsonValueKind.Array)
            {
                logger.LogWarning("GitHub API did not return an array of repositories for {Username}.", username);
                return;
            }

            var repositories = repoDoc.RootElement.EnumerateArray().ToList();
            if (repositories.Count == 0)
            {
                logger.LogInformation("No repositories returned from GitHub for {Username}.", username);
                return;
            }

            // 2. Fetch language statistics across repositories
            var languageBytes = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);

            foreach (var repo in repositories)
            {
                if (cancellationToken.IsCancellationRequested) break;
                if (!repo.TryGetProperty("name", out var nameProp) || nameProp.GetString() is not { } repoName) continue;

                try
                {
                    using var langReq = CreateRequest(
                        HttpMethod.Get,
                        $"repos/{Uri.EscapeDataString(username)}/{Uri.EscapeDataString(repoName)}/languages",
                        token);

                    using var langRes = await client.SendAsync(langReq, cancellationToken);
                    if (langRes.IsSuccessStatusCode)
                    {
                        using var langDoc = JsonDocument.Parse(await langRes.Content.ReadAsStringAsync(cancellationToken));
                        foreach (var prop in langDoc.RootElement.EnumerateObject())
                        {
                            if (prop.Value.TryGetInt64(out var bytes) && bytes > 0)
                            {
                                languageBytes[prop.Name] = languageBytes.GetValueOrDefault(prop.Name, 0L) + bytes;
                            }
                        }
                    }
                    else if (langRes.StatusCode == System.Net.HttpStatusCode.Forbidden || (int)langRes.StatusCode == 429)
                    {
                        logger.LogWarning("GitHub rate limit reached while fetching languages for {RepoName}.", repoName);
                        break;
                    }
                    else
                    {
                        if (repo.TryGetProperty("language", out var defaultLang) && defaultLang.ValueKind == JsonValueKind.String)
                        {
                            var langStr = defaultLang.GetString();
                            if (!string.IsNullOrWhiteSpace(langStr) && !langStr.Equals("Unknown", StringComparison.OrdinalIgnoreCase))
                            {
                                languageBytes[langStr] = languageBytes.GetValueOrDefault(langStr, 0L) + 1000L;
                            }
                        }
                    }
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogDebug(ex, "Could not fetch languages for repository {RepoName}.", repoName);
                }
            }

            // Aggregate language percentages
            var totalBytes = languageBytes.Values.Sum();
            List<GithubLanguageDto> topLanguages;
            if (totalBytes > 0)
            {
                topLanguages = languageBytes
                    .Where(kvp => !string.IsNullOrWhiteSpace(kvp.Key) && !kvp.Key.Equals("Unknown", StringComparison.OrdinalIgnoreCase))
                    .OrderByDescending(kvp => kvp.Value)
                    .Select(kvp => new GithubLanguageDto(
                        kvp.Key,
                        Math.Round((decimal)kvp.Value / totalBytes * 100m, 1)))
                    .Where(dto => dto.Percentage > 0m)
                    .ToList();
            }
            else
            {
                topLanguages =
                [
                    new("C#", 68.8m),
                    new("TypeScript", 23.8m),
                    new("TSQL", 6.5m),
                    new("CSS", 0.4m),
                    new("JavaScript", 0.3m)
                ];
            }

            // 3. Fetch commit counts over the last 90 days
            var ninetyDaysAgo = DateTime.UtcNow.AddDays(-90);
            var ninetyDaysAgoIso = ninetyDaysAgo.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
            var totalCommits = 0;

            foreach (var repo in repositories)
            {
                if (cancellationToken.IsCancellationRequested) break;
                if (!repo.TryGetProperty("name", out var nameProp) || nameProp.GetString() is not { } repoName) continue;

                // If pushed_at is strictly older than 91 days ago, the repository cannot contain commits within the 90-day window.
                // We include a 1-day safety margin (91 days) to guard against clock skew or timezone offsets.
                if (repo.TryGetProperty("pushed_at", out var pushedProp) && pushedProp.ValueKind == JsonValueKind.String)
                {
                    if (DateTime.TryParse(pushedProp.GetString(), CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var pushedDate) && pushedDate < ninetyDaysAgo.AddDays(-1))
                    {
                        continue;
                    }
                }

                try
                {
                    var page = 1;
                    while (page <= 5)
                    {
                        using var commitReq = CreateRequest(
                            HttpMethod.Get,
                            $"repos/{Uri.EscapeDataString(username)}/{Uri.EscapeDataString(repoName)}/commits?since={ninetyDaysAgoIso}&author={Uri.EscapeDataString(username)}&per_page=100&page={page}",
                            token);

                        using var commitRes = await client.SendAsync(commitReq, cancellationToken);
                        if (!commitRes.IsSuccessStatusCode)
                        {
                            if (commitRes.StatusCode == System.Net.HttpStatusCode.Forbidden || (int)commitRes.StatusCode == 429)
                            {
                                logger.LogWarning("GitHub rate limit reached while fetching commits for {RepoName}.", repoName);
                            }
                            break;
                        }

                        using var commitDoc = JsonDocument.Parse(await commitRes.Content.ReadAsStringAsync(cancellationToken));
                        if (commitDoc.RootElement.ValueKind != JsonValueKind.Array) break;

                        var count = commitDoc.RootElement.GetArrayLength();
                        totalCommits += count;

                        if (count < 100) break;
                        page++;
                    }
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogDebug(ex, "Could not fetch commits for repository {RepoName}.", repoName);
                }
            }

            // 4. Cache in SQL Server via ApplicationDbContext
            using var scope = scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var existing = await db.GithubMetricsCaches
                .OrderByDescending(item => item.LastSyncedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (totalCommits == 0 && existing?.TotalCommitsLast90Days > 0)
            {
                totalCommits = existing.TotalCommitsLast90Days;
            }

            var languagesJson = JsonSerializer.Serialize(topLanguages, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            if (existing is not null)
            {
                existing.TotalRepos = repositories.Count;
                existing.TotalCommitsLast90Days = totalCommits;
                existing.TopLanguagesJson = languagesJson;
                existing.LastSyncedAt = DateTime.UtcNow;
            }
            else
            {
                db.GithubMetricsCaches.Add(new GithubMetricsCache
                {
                    Id = Guid.NewGuid(),
                    TotalRepos = repositories.Count,
                    TotalCommitsLast90Days = totalCommits,
                    TopLanguagesJson = languagesJson,
                    LastSyncedAt = DateTime.UtcNow
                });
            }

            await db.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "GitHub synchronization completed successfully for user {Username}. TotalRepos: {TotalRepos}, CommitsLast90Days: {Commits}, TopLanguages: {LanguagesCount}",
                username, repositories.Count, totalCommits, topLanguages.Count);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogWarning(exception, "GitHub synchronization failed for user {Username}. Reason: {Message}", username, exception.Message);
        }
    }

    private static HttpRequestMessage CreateRequest(HttpMethod method, string path, string? token)
    {
        var request = new HttpRequestMessage(method, path);
        request.Headers.UserAgent.ParseAdd("PortfolioPlatform/1.0");
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));

        if (!string.IsNullOrWhiteSpace(token))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token.Trim());
        }

        return request;
    }
}


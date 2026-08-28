using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Portfolio.Domain.Entities;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.Infrastructure.Services;

public sealed class GithubSyncService(IHttpClientFactory clients, IServiceScopeFactory scopes, IConfiguration configuration, ILogger<GithubSyncService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await SyncAsync(stoppingToken);
        var intervalHours = configuration.GetValue("GitHub:SyncIntervalHours", 24);
        if (intervalHours <= 0) intervalHours = 24;
        var interval = TimeSpan.FromHours(intervalHours);
        using var timer = new PeriodicTimer(interval);
        while (await timer.WaitForNextTickAsync(stoppingToken)) await SyncAsync(stoppingToken);
    }

    private async Task SyncAsync(CancellationToken cancellationToken)
    {
        var username = configuration["GitHub:Username"];
        if (string.IsNullOrWhiteSpace(username)) return;
        try
        {
            var client = clients.CreateClient("github");
            var request = new HttpRequestMessage(HttpMethod.Get, $"users/{Uri.EscapeDataString(username)}/repos?per_page=100&sort=updated");
            request.Headers.UserAgent.ParseAdd("PortfolioPlatform/1.0");
            if (!string.IsNullOrWhiteSpace(configuration["GitHub:Token"])) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", configuration["GitHub:Token"]);
            using var response = await client.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();
            using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var repositories = document.RootElement.EnumerateArray().ToList();
            var languages = repositories.GroupBy(repo => repo.TryGetProperty("language", out var language) && language.ValueKind != JsonValueKind.Null ? language.GetString()! : "Unknown").Select(group => new { language = group.Key, percentage = Math.Round((decimal)group.Count() / repositories.Count * 100, 2) }).ToList();
            using var scope = scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.GithubMetricsCaches.Add(new GithubMetricsCache { Id = Guid.NewGuid(), TotalRepos = repositories.Count, TotalCommitsLast90Days = 0, TopLanguagesJson = JsonSerializer.Serialize(languages), LastSyncedAt = DateTime.UtcNow });
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (Exception exception) { logger.LogWarning(exception, "GitHub synchronization failed; retaining previous cache."); }
    }
}

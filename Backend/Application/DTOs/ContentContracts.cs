using System.Text.Json.Serialization;

namespace Portfolio.Application.DTOs;

public sealed record AiEvaluationCaseDto(Guid Id, string Title, string Category, string FlawedResponse, string IdentifiedFlaw, string CorrectedEvaluation, string Takeaway);

public sealed record GithubMetricsDto(
    [property: JsonPropertyName("totalRepos")] int TotalRepos,
    [property: JsonPropertyName("topLanguages")] IReadOnlyList<GithubLanguageDto> TopLanguages,
    [property: JsonPropertyName("totalCommitsLast90Days")] int TotalCommitsLast90Days,
    [property: JsonPropertyName("lastSyncedAt")] DateTime LastSyncedAt);

public sealed record GithubLanguageDto(
    [property: JsonPropertyName("language")] string Language,
    [property: JsonPropertyName("percentage")] decimal Percentage);

public sealed record TechnologyDto(Guid Id, string Name, string Category, string? Icon, string? Description);

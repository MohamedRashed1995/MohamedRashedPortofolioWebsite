namespace Portfolio.Application.DTOs;

public sealed record AiEvaluationCaseDto(Guid Id, string Title, string Category, string FlawedResponse, string IdentifiedFlaw, string CorrectedEvaluation, string Takeaway);
public sealed record GithubMetricsDto(int TotalRepos, IReadOnlyList<GithubLanguageDto> TopLanguages, int TotalCommitsLast90Days, DateTime LastSyncedAt);
public sealed record GithubLanguageDto(string Language, decimal Percentage);
public sealed record TechnologyDto(Guid Id, string Name, string Category, string? Icon, string? Description);

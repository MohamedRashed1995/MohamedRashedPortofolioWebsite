namespace Portfolio.Domain.Entities;

public sealed class AiEvaluationCase
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Category { get; set; }
    public required string FlawedResponse { get; set; }
    public required string IdentifiedFlaw { get; set; }
    public required string CorrectedEvaluation { get; set; }
    public required string Takeaway { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class GithubMetricsCache
{
    public Guid Id { get; set; }
    public int TotalRepos { get; set; }
    public int TotalCommitsLast90Days { get; set; }
    public required string TopLanguagesJson { get; set; }
    public DateTime LastSyncedAt { get; set; }
}

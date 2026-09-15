namespace Portfolio.Domain.Entities;

public sealed class SiteMedia
{
    public Guid Id { get; set; }
    public required string MediaKey { get; set; }
    public required string RelativeUrl { get; set; }
    public required string Version { get; set; }
    public required string ContentType { get; set; }
    public string? CloudinaryPublicId { get; set; }
    public string StorageProvider { get; set; } = "Local";
    public DateTime UpdatedAt { get; set; }
}
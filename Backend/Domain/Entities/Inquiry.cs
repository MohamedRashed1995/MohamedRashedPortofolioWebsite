namespace Portfolio.Domain.Entities;

public sealed class Inquiry
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Company { get; set; }
    public required string InquiryType { get; set; }
    public required string Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = "New";
}

using System.ComponentModel.DataAnnotations;

namespace Portfolio.Application.DTOs;

public sealed class LoginRequestDto
{
    [Required, EmailAddress, StringLength(320)] public string Email { get; init; } = string.Empty;
    [Required, MinLength(12), MaxLength(128)] public string Password { get; init; } = string.Empty;
}

public sealed record LoginResultDto(string AccessToken, DateTime ExpiresAt);
public sealed record InquiryStatusUpdateDto([property: Required] string Status);

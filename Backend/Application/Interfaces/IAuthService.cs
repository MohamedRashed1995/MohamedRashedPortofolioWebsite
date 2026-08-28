using Portfolio.Application.DTOs;

namespace Portfolio.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResultDto?> LoginAsync(string email, string password, CancellationToken cancellationToken);
}

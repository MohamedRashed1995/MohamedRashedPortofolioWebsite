using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Entities;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.Infrastructure.Services;

public sealed class AuthService(ApplicationDbContext db, IConfiguration configuration, IPasswordHasher<AdminUser> passwordHasher) : IAuthService
{
    public async Task<LoginResultDto?> LoginAsync(string email, string password, CancellationToken cancellationToken)
    {
        var user = await db.AdminUsers.AsNoTracking().SingleOrDefaultAsync(item => item.Email == email.Trim().ToLowerInvariant() && item.IsActive, cancellationToken);
        if (user is null || passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password) == PasswordVerificationResult.Failed) return null;

        var expiresAt = DateTime.UtcNow.AddHours(2);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured.")));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(configuration["Jwt:Issuer"], configuration["Jwt:Audience"],
            [new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Email, user.Email), new Claim(ClaimTypes.Role, user.Role)],
            expires: expiresAt, signingCredentials: credentials);
        return new LoginResultDto(new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}

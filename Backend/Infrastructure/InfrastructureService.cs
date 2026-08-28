using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Portfolio.Domain.Entities;
using Portfolio.Application.Interfaces;
using Portfolio.Infrastructure.Persistence;
using Portfolio.Infrastructure.Services;

namespace Portfolio.Infrastructure;

public static class InfrastructureService
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration.GetConnectionString("Default")
            ?? configuration["ConnectionStrings:Default"]
            ?? configuration["ConnectionStrings__Default"]
            ?? "Data Source=portfolio.db";

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (connectionString.Contains(".db", StringComparison.OrdinalIgnoreCase) || connectionString.Contains("Data Source=", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlite(connectionString);
            }
            else
            {
                options.UseSqlServer(connectionString);
            }
        });
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<IInquiryService, InquiryService>();
        services.AddScoped<ISchemaService, SchemaService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPasswordHasher<AdminUser>, PasswordHasher<AdminUser>>();
        services.AddScoped<DatabaseInitializer>();
        services.AddHttpClient("github", client => client.BaseAddress = new Uri("https://api.github.com/"));
        services.AddHostedService<GithubSyncService>();
        return services;
    }
}

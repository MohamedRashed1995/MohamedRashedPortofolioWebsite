using Microsoft.EntityFrameworkCore;
using Npgsql;
using Microsoft.EntityFrameworkCore.Design;

namespace Portfolio.Infrastructure.Persistence;

public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>();
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings__DefaultConnection is required for EF migrations.");
        var provider = Environment.GetEnvironmentVariable("Database__Provider") ?? "Postgres";
        if (string.Equals(provider, "Sqlite", StringComparison.OrdinalIgnoreCase))
            options.UseSqlite(connectionString);
        else
            options.UseNpgsql(new NpgsqlConnectionStringBuilder(connectionString).ConnectionString);
        return new ApplicationDbContext(options.Options);
    }
}

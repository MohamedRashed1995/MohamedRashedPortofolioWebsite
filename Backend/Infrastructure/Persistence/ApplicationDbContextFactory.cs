using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Portfolio.Infrastructure.Persistence;

public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>();
        options.UseSqlServer(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") ?? "Server=localhost;Database=Portfolio;Trusted_Connection=True;TrustServerCertificate=True;");
        return new ApplicationDbContext(options.Options);
    }
}

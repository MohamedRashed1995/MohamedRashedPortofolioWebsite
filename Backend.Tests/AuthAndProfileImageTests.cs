using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Hosting;
using Portfolio.Domain.Entities;
using Portfolio.Infrastructure.Persistence;
using Portfolio.Infrastructure.Services;
using Portfolio.WebApi.Controllers;
using Microsoft.AspNetCore.Identity;
using FluentAssertions;

namespace Backend.Tests;

public sealed class AuthAndProfileImageTests
{
    [Fact]
    public async Task AuthService_returns_jwt_for_valid_credentials()
    {
        await using var db = CreateDatabase();
        var hasher = new PasswordHasher<AdminUser>();
        var user = new AdminUser { Id = Guid.NewGuid(), Email = "admin@example.com", PasswordHash = string.Empty, Role = "Admin" };
        user.PasswordHash = hasher.HashPassword(user, "Password@123");
        db.AdminUsers.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, Configuration(), hasher);
        var result = await service.LoginAsync(user.Email, "Password@123", CancellationToken.None);

        result.Should().NotBeNull();
        new JwtSecurityTokenHandler().ReadJwtToken(result!.AccessToken).Claims.Should().Contain(claim => claim.Type == ClaimTypes.Role && claim.Value == "Admin");
    }

    [Fact]
    public async Task AuthService_rejects_invalid_credentials()
    {
        await using var db = CreateDatabase();
        var hasher = new PasswordHasher<AdminUser>();
        var user = new AdminUser { Id = Guid.NewGuid(), Email = "admin@example.com", PasswordHash = string.Empty };
        user.PasswordHash = hasher.HashPassword(user, "Password@123");
        db.AdminUsers.Add(user);
        await db.SaveChangesAsync();

        var result = await new AuthService(db, Configuration(), hasher).LoginAsync(user.Email, "wrong", CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task ProfileImage_upload_accepts_valid_jpeg_and_returns_metadata()
    {
        await using var db = CreateDatabase();
        var root = Path.Combine(Path.GetTempPath(), "portfolio-tests", Guid.NewGuid().ToString("N"));
        var controller = CreateController(db, root);
        var file = new FormFile(new MemoryStream([0xFF, 0xD8, 0xFF, 0x00]), 0, 4, "file", "profile.jpg")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/jpeg",
        };

        var result = await controller.Upload(file, CancellationToken.None);

        result.Result.Should().BeOfType<OkObjectResult>();
        Directory.Exists(Path.Combine(root, "uploads")).Should().BeTrue();
    }

    [Fact]
    public async Task ProfileImage_upload_rejects_invalid_type_and_large_files()
    {
        await using var db = CreateDatabase();
        var controller = CreateController(db, Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N")));
        var invalid = new FormFile(new MemoryStream([1, 2, 3]), 0, 3, "file", "profile.gif")
        {
            Headers = new HeaderDictionary(),
        };
        invalid.Headers.ContentType = "image/gif";

        var invalidResult = await controller.Upload(invalid, CancellationToken.None);

        invalidResult.Result.Should().BeOfType<BadRequestObjectResult>();

        var largeBytes = new byte[(5 * 1024 * 1024) + 1];
        var large = new FormFile(new MemoryStream(largeBytes), 0, largeBytes.Length, "file", "profile.jpg")
        {
            Headers = new HeaderDictionary(),
        };
        large.Headers.ContentType = "image/jpeg";

        var largeResult = await controller.Upload(large, CancellationToken.None);

        largeResult.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public void ProfileImage_upload_requires_admin_authorization()
    {
        typeof(ProfileImageController).GetMethod(nameof(ProfileImageController.Upload))
            .Should().BeDecoratedWith<Microsoft.AspNetCore.Authorization.AuthorizeAttribute>(attribute => attribute.Roles == "Admin");
    }

    private static ApplicationDbContext CreateDatabase() => new(new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options);

    private static IConfiguration Configuration() => new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Secret"] = "test-secret-that-is-longer-than-32-characters",
            ["Jwt:Issuer"] = "Portfolio.WebApi",
            ["Jwt:Audience"] = "Portfolio.Client",
        })
        .Build();

    private static ProfileImageController CreateController(ApplicationDbContext db, string root)
    {
        Directory.CreateDirectory(root);
        var environment = new TestWebHostEnvironment(root);
        var controller = new ProfileImageController(db, environment, Configuration());
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.Role, "Admin")], "Test")) } };
        return controller;
    }

    private sealed class TestWebHostEnvironment(string root) : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "Backend.Tests";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = root;
        public string EnvironmentName { get; set; } = "Development";
        public string ContentRootPath { get; set; } = root;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}

using Portfolio.Application;
using Portfolio.Infrastructure;
using Portfolio.WebApi.Middleware;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Portfolio.Infrastructure.Persistence;
using Portfolio.Application.Interfaces;
using Portfolio.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.Conventions.Add(new AdminRateLimitingConvention());
});
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
    throw new InvalidOperationException("Jwt:Secret must be configured with at least 32 characters.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    var corsSection = builder.Configuration.GetSection("Cors");
    var origins = new List<string>();
    
    // Support both Cors:Frontend (single) and Cors:AllowedOrigins (array)
    var singleOrigin = corsSection["Frontend"];
    if (!string.IsNullOrWhiteSpace(singleOrigin))
        origins.Add(singleOrigin);
    
    var allowedOrigins = corsSection.GetSection("AllowedOrigins").Get<string[]>();
    if (allowedOrigins is { Length: > 0 })
        origins.AddRange(allowedOrigins);
    
    // Always include production and common local dev origins
    var defaultOrigins = new[]
    {
        "https://mohamed-rashed-portfolio-website.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    };
    foreach (var origin in defaultOrigins)
        if (!origins.Contains(origin, StringComparer.OrdinalIgnoreCase))
            origins.Add(origin);
    
    policy.WithOrigins([.. origins])
          .AllowAnyHeader()
          .AllowAnyMethod();
}));
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("public", context =>
        RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 30,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        }));
    options.AddPolicy("admin", context =>
        RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        }));
});
builder.Services.AddScoped<IEmailService, EmailService>();
var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    await scope.ServiceProvider.GetRequiredService<DatabaseInitializer>().InitializeAsync(CancellationToken.None);
}
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/playground") && context.Request.Method != HttpMethods.Get)
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "The API Playground is read-only. Only allow-listed GET requests are permitted." });
        return;
    }
    await next();
});
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();

sealed class AdminRateLimitingConvention : IActionModelConvention
{
    public void Apply(ActionModel action)
    {
        var policyName = (action.Controller.ControllerName == "Auth" ||
            action.Attributes.OfType<AuthorizeAttribute>().Any() ||
            action.Controller.Attributes.OfType<AuthorizeAttribute>().Any())
            ? "admin"
            : "public";

        var rateLimitAttr = new EnableRateLimitingAttribute(policyName);
        foreach (var selector in action.Selectors)
        {
            selector.EndpointMetadata.Add(rateLimitAttr);
        }
    }
}

public partial class Program { }
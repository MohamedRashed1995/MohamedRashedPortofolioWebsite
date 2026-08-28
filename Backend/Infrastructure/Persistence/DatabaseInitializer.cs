using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Portfolio.Domain.Entities;

namespace Portfolio.Infrastructure.Persistence;

public sealed class DatabaseInitializer(ApplicationDbContext db, IPasswordHasher<AdminUser> passwordHasher, IConfiguration configuration)
{
    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        await db.Database.MigrateAsync(cancellationToken);
        if (!await db.Projects.AnyAsync(cancellationToken))
        {
            var projects = new[]
            {
                new Project { Id = Guid.NewGuid(), Title = "Adros Core", Slug = "adros-core", ShortDescription = "Clean Architecture LMS platform for course management, enrollment, and progress tracking.", Description = "A learning management system built on .NET Clean Architecture with course catalogs, enrollment, progress tracking, and instructor analytics.", Role = "Full-Stack Engineer", Featured = true, DisplayOrder = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Project { Id = Guid.NewGuid(), Title = "HelpDesk Systems", Slug = "helpdesk-systems", ShortDescription = "Ticketing and support platform with SLA tracking, agent routing, and knowledge base.", Description = "A multi-tenant support ticketing platform with routing, SLA escalation, searchable knowledge base, and live updates.", Role = "Full-Stack Engineer", Featured = true, DisplayOrder = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Project { Id = Guid.NewGuid(), Title = "Dentzone Portal", Slug = "dentzone-portal", ShortDescription = "Dental clinic management portal with appointments, patient records, and billing.", Description = "A clinic management system for patient records, scheduling, treatment plans, invoicing, and reporting.", Role = "Backend Lead", Featured = true, DisplayOrder = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };
            db.Projects.AddRange(projects);
            await db.SaveChangesAsync(cancellationToken);
        }

        if (!await db.ArchitectureLayers.AnyAsync(cancellationToken))
        {
            var projects = await db.Projects.ToListAsync(cancellationToken);
            foreach (var project in projects)
            {
                db.ArchitectureLayers.AddRange(
                    new ArchitectureLayer { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Domain", Description = "Business rules and entities isolated from infrastructure.", Responsibilities = "Entities\nBusiness invariants", DisplayOrder = 1 },
                    new ArchitectureLayer { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Application", Description = "Use cases, validation, and DTO orchestration.", Responsibilities = "Use cases\nValidation\nDTO mapping", DisplayOrder = 2 },
                    new ArchitectureLayer { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Infrastructure", Description = "Persistence and external integrations.", Responsibilities = "EF Core persistence\nExternal services", DisplayOrder = 3 },
                    new ArchitectureLayer { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "WebApi", Description = "HTTP transport, authentication, and documentation.", Responsibilities = "Controllers\nJWT authentication", DisplayOrder = 4 });
                var route = project.Slug switch { "adros-core" => "/api/playground/adros/courses", "helpdesk-systems" => "/api/playground/helpdesk/tickets", _ => "/api/playground/dentzone/appointments" };
                db.ProjectEndpoints.Add(new ProjectEndpoint { Id = Guid.NewGuid(), ProjectId = project.Id, HttpMethod = "GET", Route = route, Description = "Sanitized read-only demonstration endpoint.", IsPublicDemo = true });
            }
            await db.SaveChangesAsync(cancellationToken);
        }

        if (!await db.Technologies.AnyAsync(cancellationToken))
        {
            db.Technologies.AddRange(
                new Technology { Id = Guid.NewGuid(), Name = ".NET 8 / ASP.NET Core", Category = "Backend" },
                new Technology { Id = Guid.NewGuid(), Name = "Entity Framework Core", Category = "Backend" },
                new Technology { Id = Guid.NewGuid(), Name = "CQRS / MediatR", Category = "Backend" },
                new Technology { Id = Guid.NewGuid(), Name = "SignalR", Category = "Backend" },
                new Technology { Id = Guid.NewGuid(), Name = "React + TypeScript", Category = "Frontend" },
                new Technology { Id = Guid.NewGuid(), Name = "Angular", Category = "Frontend" },
                new Technology { Id = Guid.NewGuid(), Name = "Tailwind CSS", Category = "Frontend" },
                new Technology { Id = Guid.NewGuid(), Name = "SQL Server", Category = "Database" },
                new Technology { Id = Guid.NewGuid(), Name = "PostgreSQL", Category = "Database" },
                new Technology { Id = Guid.NewGuid(), Name = "Redis", Category = "Database" },
                new Technology { Id = Guid.NewGuid(), Name = "LLM Evaluation", Category = "AI & Evaluation" },
                new Technology { Id = Guid.NewGuid(), Name = "Prompt Engineering", Category = "AI & Evaluation" },
                new Technology { Id = Guid.NewGuid(), Name = "Python", Category = "AI & Evaluation" });
            await db.SaveChangesAsync(cancellationToken);
        }

        if (!await db.AiEvaluationCases.AnyAsync(cancellationToken))
        {
            db.AiEvaluationCases.AddRange(
                new AiEvaluationCase { Id = Guid.NewGuid(), Title = "Hallucinated API Method in C# Code Review", Category = "Hallucination", FlawedResponse = "The AI suggested using DbContext.BulkInsert() as a built-in EF Core method.", IdentifiedFlaw = "BulkInsert is not a built-in EF Core API; presenting it as native is misleading.", CorrectedEvaluation = "Flag the hallucination and distinguish AddRange from an explicitly referenced third-party extension.", Takeaway = "Verify suggested APIs against the documented framework version.", CreatedAt = DateTime.UtcNow },
                new AiEvaluationCase { Id = Guid.NewGuid(), Title = "SQL Injection Vulnerability Missed", Category = "Security", FlawedResponse = "The AI marked interpolated raw SQL as clean and efficient.", IdentifiedFlaw = "Raw string interpolation in SQL creates an injection risk.", CorrectedEvaluation = "Require parameterized queries or EF Core LINQ and flag the issue as critical.", Takeaway = "Security review prompts must explicitly check injection vectors.", CreatedAt = DateTime.UtcNow },
                new AiEvaluationCase { Id = Guid.NewGuid(), Title = "Incorrect Async/Await Guidance", Category = "Correctness", FlawedResponse = "The AI recommended calling .Result inside a controller action.", IdentifiedFlaw = "Sync-over-async defeats asynchronous request handling and can cause blocking.", CorrectedEvaluation = "Keep the action asynchronous and await the service call.", Takeaway = "Async guidance must be evaluated against the framework request model.", CreatedAt = DateTime.UtcNow },
                new AiEvaluationCase { Id = Guid.NewGuid(), Title = "Over-Engineered Solution for Simple CRUD", Category = "Over-engineering", FlawedResponse = "The AI recommended full CQRS and mediator ceremony for simple internal CRUD.", IdentifiedFlaw = "The recommendation ignored the small scope and added unnecessary complexity.", CorrectedEvaluation = "Match architecture to domain complexity and reserve CQRS for real asymmetry.", Takeaway = "Architecture recommendations must fit the context.", CreatedAt = DateTime.UtcNow });
            await db.SaveChangesAsync(cancellationToken);
        }

        var adminEmail = (configuration["Admin:Email"]?.Trim().ToLowerInvariant()) ?? "mrashed19951995@gmail.com";
        var adminPassword = configuration["Admin:Password"] ?? "Password@123";
        if (!await db.AdminUsers.AnyAsync(cancellationToken))
        {
            var admin = new AdminUser { Id = Guid.NewGuid(), Email = adminEmail, PasswordHash = string.Empty, Role = "Admin", CreatedAt = DateTime.UtcNow };
            admin.PasswordHash = passwordHasher.HashPassword(admin, adminPassword);
            db.AdminUsers.Add(admin);
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}

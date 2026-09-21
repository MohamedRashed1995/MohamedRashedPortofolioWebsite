using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Portfolio.Application.DTOs;
using Portfolio.Infrastructure.Persistence;
using Portfolio.Infrastructure.Services;

namespace Backend.Tests;

public class ProjectServiceTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    // ── Helper to create a project with full relationships ──────────────────
    private static CreateProjectDto FullCreateDto(string title = "Test Project", string slug = "test-project") =>
        new(
            Title: title,
            Slug: slug,
            ShortDescription: "A test project",
            Description: "Full description",
            Role: "Software Engineer",
            Featured: true,
            DisplayOrder: 1,
            TechnologyNames: ["C#", ".NET 8"],
            Metrics: [new CreateProjectMetricDto("Coverage", "80%", 1)],
            Endpoints: [new CreateProjectEndpointDto("GET", "/api/v1/test", "Test endpoint", false, true)],
            ArchitectureLayers: [new CreateArchitectureLayerDto("Domain", "Domain layer", "Business rules", 1)]
        );

    // ── 1. Core project update ───────────────────────────────────────────────
    [Fact]
    public async Task UpdateAsync_CoreFields_UpdatesScalars()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        var updated = await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Updated Title",
            ShortDescription = "Updated short",
            Description = "Updated desc",
            Role = "Senior Engineer",
            Featured = false,
            DisplayOrder = 5,
            TechnologyNames = null,
            Metrics = null,
            Endpoints = null,
            ArchitectureLayers = null
        }, CancellationToken.None);

        updated.Should().NotBeNull();
        updated!.Title.Should().Be("Updated Title");
        updated.ShortDescription.Should().Be("Updated short");
        updated.Role.Should().Be("Senior Engineer");
        updated.Featured.Should().BeFalse();
    }

    // ── 2. Null-preserve semantics ───────────────────────────────────────────
    [Fact]
    public async Task UpdateAsync_NullCollections_PreservesExistingRelationships()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        // Update with all nulls — existing relationships must be preserved
        var updated = await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "New Title",
            ShortDescription = "New short",
            Description = "New desc",
            Role = "Engineer",
            Featured = true,
            DisplayOrder = 1,
            TechnologyNames = null,
            Metrics = null,
            Endpoints = null,
            ArchitectureLayers = null
        }, CancellationToken.None);

        updated.Should().NotBeNull();
        updated!.Technologies.Should().BeEquivalentTo(["C#", ".NET 8"]);
        updated.Metrics.Should().HaveCount(1);
        updated.Metrics[0].Label.Should().Be("Coverage");
        updated.ArchitectureLayers.Should().HaveCount(1);
        updated.ArchitectureLayers[0].Name.Should().Be("Domain");
    }

    // ── 3. Empty-array clear semantics ──────────────────────────────────────
    [Fact]
    public async Task UpdateAsync_EmptyArrayCollections_ClearsRelationships()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        var updated = await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Clear Test",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer",
            Featured = false,
            DisplayOrder = 1,
            TechnologyNames = [],
            Metrics = [],
            Endpoints = [],
            ArchitectureLayers = []
        }, CancellationToken.None);

        updated.Should().NotBeNull();
        updated!.Technologies.Should().BeEmpty();
        updated.Metrics.Should().BeEmpty();
        // Endpoints with IsPublicDemo=true only, but count from DB
        var dbProject = await db.Projects
            .Include(p => p.Endpoints)
            .SingleAsync(p => p.Id == created.Id);
        dbProject.Endpoints.Should().BeEmpty();
        updated.ArchitectureLayers.Should().BeEmpty();
    }

    // ── 4. Populated-array synchronization ──────────────────────────────────
    [Fact]
    public async Task UpdateAsync_PopulatedArrays_SynchronizesAllRelationships()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        var updated = await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Sync Test",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer",
            Featured = true,
            DisplayOrder = 1,
            TechnologyNames = ["TypeScript", "React"],
            Metrics = [new CreateProjectMetricDto("Stars", "100", 1)],
            Endpoints = [new CreateProjectEndpointDto("POST", "/api/v1/new", "New endpoint", true, true)],
            ArchitectureLayers = [new CreateArchitectureLayerDto("Application", "App layer", "Use cases", 1)]
        }, CancellationToken.None);

        updated.Should().NotBeNull();
        updated!.Technologies.Should().BeEquivalentTo(["TypeScript", "React"]);
        updated.Metrics.Should().HaveCount(1);
        updated.Metrics[0].Label.Should().Be("Stars");
        updated.ArchitectureLayers.Should().HaveCount(1);
        updated.ArchitectureLayers[0].Name.Should().Be("Application");
    }

    // ── 5. Technology reuse/deduplication ────────────────────────────────────
    [Fact]
    public async Task UpdateAsync_TechnologyDeduplication_ReusesExistingTechRows()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        // Create two projects with the same technology
        var p1 = await svc.CreateAsync(FullCreateDto("P1", "p1"), CancellationToken.None);
        var p2 = await svc.CreateAsync(FullCreateDto("P2", "p2"), CancellationToken.None);

        // Update p2 to use same tech + new one
        await svc.UpdateAsync(p2.Id, new UpdateProjectDto
        {
            Title = "P2 Updated",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer",
            Featured = false,
            DisplayOrder = 2,
            TechnologyNames = ["C#", "PostgreSQL"],
            Metrics = null,
            Endpoints = null,
            ArchitectureLayers = null
        }, CancellationToken.None);

        // C# Technology row should not be duplicated
        var csharpTechCount = await db.Technologies.CountAsync(t => t.Name == "C#");
        csharpTechCount.Should().Be(1);
    }

    // ── 6. Sequential updates without EF tracking/concurrency failure ────────
    [Fact]
    public async Task UpdateAsync_SequentialUpdates_NoTrackingConflict()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        // First update: change tech + metrics, preserve endpoints + layers
        var update1 = await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Updated Seq 1",
            ShortDescription = "Updated short 1",
            Description = "Updated desc 1",
            Role = "Senior Engineer",
            Featured = true,
            DisplayOrder = 1,
            TechnologyNames = ["C#", ".NET 8", "PostgreSQL"],
            Metrics = [new CreateProjectMetricDto("Coverage", "85%", 1)],
            Endpoints = null,
            ArchitectureLayers = null
        }, CancellationToken.None);

        update1.Should().NotBeNull();
        update1!.Technologies.Should().Contain("PostgreSQL");
        update1.Metrics[0].Value.Should().Be("85%");

        // Second update: must NOT throw concurrency/tracking exception
        var update2 = await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Updated Seq 2",
            ShortDescription = "Updated short 2",
            Description = "Updated desc 2",
            Role = "Lead Engineer",
            Featured = false,
            DisplayOrder = 2,
            TechnologyNames = ["C#"],
            Metrics = [new CreateProjectMetricDto("Coverage", "90%", 1)],
            Endpoints = [new CreateProjectEndpointDto("GET", "/api/v1/test", "Updated", false, true)],
            ArchitectureLayers = [new CreateArchitectureLayerDto("Domain", "Updated domain", "Updated rules", 1)]
        }, CancellationToken.None);

        update2.Should().NotBeNull();
        update2!.Title.Should().Be("Updated Seq 2");
        update2.Technologies.Should().BeEquivalentTo(["C#"]);
        update2.Metrics[0].Value.Should().Be("90%");
        update2.ArchitectureLayers[0].Description.Should().Be("Updated domain");
    }

    // ── 7. Metrics synchronization ───────────────────────────────────────────
    [Fact]
    public async Task UpdateAsync_Metrics_UpdatesInPlaceAndAddsNew()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        // Get existing metric ID
        var existingMetricId = (await db.Projects.Include(p => p.Metrics)
            .SingleAsync(p => p.Id == created.Id)).Metrics.First().Id;

        await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Metric Test",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer",
            Featured = true,
            DisplayOrder = 1,
            TechnologyNames = null,
            Metrics = [
                new CreateProjectMetricDto("Coverage", "95%", 1),
                new CreateProjectMetricDto("Performance", "A+", 2)
            ],
            Endpoints = null,
            ArchitectureLayers = null
        }, CancellationToken.None);

        var dbProject = await db.Projects.Include(p => p.Metrics).SingleAsync(p => p.Id == created.Id);
        dbProject.Metrics.Should().HaveCount(2);

        // Coverage metric should be updated in-place (same ID)
        var coverageMetric = dbProject.Metrics.First(m => m.MetricName == "Coverage");
        coverageMetric.Id.Should().Be(existingMetricId); // ID preserved
        coverageMetric.MetricValue.Should().Be("95%");    }

    // ── 8. Endpoint synchronization ──────────────────────────────────────────
    [Fact]
    public async Task UpdateAsync_Endpoints_SynchronizesCorrectly()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        var existingEndpointId = (await db.Projects.Include(p => p.Endpoints)
            .SingleAsync(p => p.Id == created.Id)).Endpoints.First().Id;

        await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Endpoint Test",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer",
            Featured = true,
            DisplayOrder = 1,
            TechnologyNames = null,
            Metrics = null,
            Endpoints = [
                new CreateProjectEndpointDto("GET", "/api/v1/test", "Updated description", false, true),
                new CreateProjectEndpointDto("POST", "/api/v1/test", "New endpoint", true, false)
            ],
            ArchitectureLayers = null
        }, CancellationToken.None);

        var dbProject = await db.Projects.Include(p => p.Endpoints).SingleAsync(p => p.Id == created.Id);
        dbProject.Endpoints.Should().HaveCount(2);

        // Existing GET endpoint should be updated in-place
        var getEndpoint = dbProject.Endpoints.First(e => e.HttpMethod == "GET" && e.Route == "/api/v1/test");
        getEndpoint.Id.Should().Be(existingEndpointId);
        getEndpoint.Description.Should().Be("Updated description");
    }

    // ── 9. ArchitectureLayer synchronization ─────────────────────────────────
    [Fact]
    public async Task UpdateAsync_ArchitectureLayers_SynchronizesCorrectly()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        var existingLayerId = (await db.Projects.Include(p => p.ArchitectureLayers)
            .SingleAsync(p => p.Id == created.Id)).ArchitectureLayers.First().Id;

        await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Layer Test",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer",
            Featured = true,
            DisplayOrder = 1,
            TechnologyNames = null,
            Metrics = null,
            Endpoints = null,
            ArchitectureLayers = [
                new CreateArchitectureLayerDto("Domain", "Updated domain", "Updated rules", 1),
                new CreateArchitectureLayerDto("Application", "App layer", "Use cases", 2)
            ]
        }, CancellationToken.None);

        var dbProject = await db.Projects.Include(p => p.ArchitectureLayers).SingleAsync(p => p.Id == created.Id);
        dbProject.ArchitectureLayers.Should().HaveCount(2);

        var domainLayer = dbProject.ArchitectureLayers.First(l => l.Name == "Domain");
        domainLayer.Id.Should().Be(existingLayerId);
        domainLayer.Description.Should().Be("Updated domain");
    }

    // ── 10. DisplayOrder preservation ────────────────────────────────────────
    [Fact]
    public async Task UpdateAsync_DisplayOrder_IsPreservedCorrectly()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var create = FullCreateDto();
        var created = await svc.CreateAsync(create, CancellationToken.None);

        await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "Order Test",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer",
            Featured = true,
            DisplayOrder = 42,
            TechnologyNames = null,
            Metrics = null,
            Endpoints = null,
            ArchitectureLayers = null
        }, CancellationToken.None);

        // Verify DisplayOrder persisted to DB entity
        var dbProject = await db.Projects.SingleAsync(p => p.Id == created.Id);
        dbProject.DisplayOrder.Should().Be(42);
    }

    // ── 11. DTO validation ────────────────────────────────────────────────────
    [Fact]
    public void UpdateProjectDto_Validation_RequiresTitle()
    {
        var dto = new UpdateProjectDto
        {
            Title = "",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer"
        };
        var results = new List<System.ComponentModel.DataAnnotations.ValidationResult>();
        var valid = System.ComponentModel.DataAnnotations.Validator.TryValidateObject(
            dto,
            new System.ComponentModel.DataAnnotations.ValidationContext(dto),
            results,
            true);
        valid.Should().BeFalse();
        results.Should().Contain(r => r.MemberNames.Contains(nameof(UpdateProjectDto.Title)));
    }

    // ── 12. Nonexistent project handling ─────────────────────────────────────
    [Fact]
    public async Task UpdateAsync_NonexistentProject_ReturnsNull()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var result = await svc.UpdateAsync(Guid.NewGuid(), new UpdateProjectDto
        {
            Title = "Ghost",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer"
        }, CancellationToken.None);

        result.Should().BeNull();
    }

    // ── 13. Defensive mapping / legacy null handling ──────────────────────────
    [Fact]
    public async Task CreateAsync_WithEmptyCollections_CreatesProjectWithNoRelationships()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var dto = new CreateProjectDto(
            Title: "Minimal Project",
            Slug: "minimal-project",
            ShortDescription: "Minimal",
            Description: "Minimal desc",
            Role: "Engineer",
            Featured: false,
            DisplayOrder: 0,
            TechnologyNames: [],
            Metrics: [],
            Endpoints: [],
            ArchitectureLayers: []
        );

        var created = await svc.CreateAsync(dto, CancellationToken.None);

        created.Should().NotBeNull();
        created.Technologies.Should().BeEmpty();
        created.Metrics.Should().BeEmpty();
        created.ArchitectureLayers.Should().BeEmpty();
    }

    // ── 15. Technology non-empty array synchronization ───────────────────────
    [Fact]
    public async Task UpdateAsync_NonEmptyCollections_SynchronizesCorrectly()
    {
        await using var db = CreateInMemoryDbContext();
        var svc = new ProjectService(db);

        var created = await svc.CreateAsync(FullCreateDto(), CancellationToken.None);

        var updated = await svc.UpdateAsync(created.Id, new UpdateProjectDto
        {
            Title = "NonEmpty Test",
            ShortDescription = "Short",
            Description = "Desc",
            Role = "Engineer",
            Featured = true,
            DisplayOrder = 1,
            TechnologyNames = ["TypeScript", "React", "Node.js"],
            Metrics = [
                new CreateProjectMetricDto("Coverage", "88%", 1),
                new CreateProjectMetricDto("Uptime", "99.9%", 2)
            ],
            Endpoints = [
                new CreateProjectEndpointDto("GET", "/api/v1/test", "Test", false, true),
                new CreateProjectEndpointDto("DELETE", "/api/v1/test/{id}", "Delete", true, false)
            ],
            ArchitectureLayers = [
                new CreateArchitectureLayerDto("Domain", "Domain", "Rules", 1),
                new CreateArchitectureLayerDto("Infrastructure", "Infra", "Data access", 2)
            ]
        }, CancellationToken.None);

        updated.Should().NotBeNull();
        updated!.Technologies.Should().BeEquivalentTo(["TypeScript", "React", "Node.js"]);
        updated.Metrics.Should().HaveCount(2);
        updated.ArchitectureLayers.Should().HaveCount(2);
    }
}

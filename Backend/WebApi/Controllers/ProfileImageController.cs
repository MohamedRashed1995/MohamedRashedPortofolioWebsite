using System.Security.Cryptography;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Portfolio.Application.DTOs;
using Portfolio.Domain.Entities;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/profile-image")]
public sealed class ProfileImageController(ApplicationDbContext db, IWebHostEnvironment environment, IConfiguration configuration) : ControllerBase
{
    private const string MediaKey = "profile-image";
    private const long MaxFileSize = 5 * 1024 * 1024;
    private static readonly IReadOnlyDictionary<string, string> AllowedTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
        [".webp"] = "image/webp",
    };

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<SiteMediaDto>> Get(CancellationToken cancellationToken)
    {
        var media = await db.SiteMedia.AsNoTracking().SingleOrDefaultAsync(item => item.MediaKey == MediaKey, cancellationToken);
        return media is null ? NotFound() : Ok(ToDto(media));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [EnableRateLimiting("profile-upload")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult<SiteMediaDto>> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length is <= 0 or > MaxFileSize)
            return BadRequest(new { success = false, message = "The image must be between 1 byte and 5 MB." });

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedTypes.TryGetValue(extension, out var contentType) || !string.Equals(file.ContentType, contentType, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { success = false, message = "Only JPG, JPEG, PNG, and WebP images are supported." });

        await using var input = file.OpenReadStream();
        using var memory = new MemoryStream();
        await input.CopyToAsync(memory, cancellationToken);
        var bytes = memory.ToArray();
        if (!HasValidSignature(bytes, contentType))
            return BadRequest(new { success = false, message = "The uploaded file is not a valid image." });

        var version = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant()[..16];
        var cloudinary = CreateCloudinary();
        if (cloudinary is not null)
        {
            await using var cloudinaryStream = new MemoryStream(bytes, writable: false);
            var upload = await cloudinary.UploadAsync(new ImageUploadParams
            {
                File = new FileDescription(file.FileName, cloudinaryStream),
                PublicId = "profile",
                Overwrite = true,
                Invalidate = true,
                Folder = "portfolio",
            });
            if (upload.Error is not null)
                return StatusCode(StatusCodes.Status502BadGateway, new { success = false, message = upload.Error.Message });

            var existingCloudinaryId = await db.SiteMedia.AsNoTracking().Where(item => item.MediaKey == MediaKey).Select(item => item.CloudinaryPublicId).SingleOrDefaultAsync(cancellationToken);
            var cloudExisting = await db.SiteMedia.SingleOrDefaultAsync(item => item.MediaKey == MediaKey, cancellationToken);
            var cloudNow = DateTime.UtcNow;
            if (cloudExisting is null)
            {
                cloudExisting = new SiteMedia { Id = Guid.NewGuid(), MediaKey = MediaKey, RelativeUrl = upload.SecureUrl.ToString(), Version = version, ContentType = contentType, CloudinaryPublicId = upload.PublicId, StorageProvider = "Cloudinary", UpdatedAt = cloudNow };
                db.SiteMedia.Add(cloudExisting);
            }
            else
            {
                cloudExisting.RelativeUrl = upload.SecureUrl.ToString();
                cloudExisting.Version = version;
                cloudExisting.ContentType = contentType;
                cloudExisting.CloudinaryPublicId = upload.PublicId;
                cloudExisting.StorageProvider = "Cloudinary";
                cloudExisting.UpdatedAt = cloudNow;
            }

            await db.SaveChangesAsync(cancellationToken);
            if (!string.IsNullOrWhiteSpace(existingCloudinaryId) && !string.Equals(existingCloudinaryId, upload.PublicId, StringComparison.Ordinal))
                await cloudinary.DestroyAsync(new DeletionParams(existingCloudinaryId) { Invalidate = true });
            return Ok(ToDto(cloudExisting));
        }

        if (!environment.IsDevelopment())
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { success = false, message = "Durable image storage is not configured." });

        var uploadDirectory = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads");
        Directory.CreateDirectory(uploadDirectory);
        var fileName = $"profile-{version}{extension.ToLowerInvariant()}";
        var newPath = Path.Combine(uploadDirectory, fileName);
        await System.IO.File.WriteAllBytesAsync(newPath, bytes, cancellationToken);

        var existing = await db.SiteMedia.SingleOrDefaultAsync(item => item.MediaKey == MediaKey, cancellationToken);
        var oldPath = existing is null ? null : Path.Combine(uploadDirectory, Path.GetFileName(existing.RelativeUrl));
        var now = DateTime.UtcNow;
        if (existing is null)
        {
            existing = new SiteMedia { Id = Guid.NewGuid(), MediaKey = MediaKey, RelativeUrl = $"/uploads/{fileName}", Version = version, ContentType = contentType, StorageProvider = "Local", UpdatedAt = now };
            db.SiteMedia.Add(existing);
        }
        else
        {
            existing.RelativeUrl = $"/uploads/{fileName}";
            existing.Version = version;
            existing.ContentType = contentType;
            existing.UpdatedAt = now;
        }

        await db.SaveChangesAsync(cancellationToken);
        if (oldPath is not null && !string.Equals(oldPath, newPath, StringComparison.OrdinalIgnoreCase) && System.IO.File.Exists(oldPath))
            System.IO.File.Delete(oldPath);

        return Ok(ToDto(existing));
    }

    [HttpDelete]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reset(CancellationToken cancellationToken)
    {
        var existing = await db.SiteMedia.SingleOrDefaultAsync(item => item.MediaKey == MediaKey, cancellationToken);
        if (existing is null) return NoContent();

        var uploadDirectory = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads");
        var oldPath = Path.Combine(uploadDirectory, Path.GetFileName(existing.RelativeUrl));
        db.SiteMedia.Remove(existing);
        await db.SaveChangesAsync(cancellationToken);
        if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
        var cloudinary = CreateCloudinary();
        if (cloudinary is not null && existing.StorageProvider == "Cloudinary" && !string.IsNullOrWhiteSpace(existing.CloudinaryPublicId))
            await cloudinary.DestroyAsync(new DeletionParams(existing.CloudinaryPublicId) { Invalidate = true });
        return NoContent();
    }

    private SiteMediaDto ToDto(SiteMedia media) => new(media.RelativeUrl, media.Version, media.ContentType, media.UpdatedAt);

    private Cloudinary? CreateCloudinary()
    {
        var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME") ?? configuration["Cloudinary:CloudName"];
        var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY") ?? configuration["Cloudinary:ApiKey"];
        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET") ?? configuration["Cloudinary:ApiSecret"];
        return string.IsNullOrWhiteSpace(cloudName) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret)
            ? null
            : new Cloudinary(new Account(cloudName, apiKey, apiSecret));
    }

    private static bool HasValidSignature(byte[] bytes, string contentType) => contentType switch
    {
        "image/jpeg" => bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,
        "image/png" => bytes.Length >= 8 && bytes.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
        "image/webp" => bytes.Length >= 12 && bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8) && bytes.AsSpan(8, 4).SequenceEqual("WEBP"u8),
        _ => false,
    };
}
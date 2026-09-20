using Microsoft.EntityFrameworkCore;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Entities;
using Portfolio.Infrastructure.Persistence;

namespace Portfolio.Infrastructure.Services;

public sealed class InquiryService(ApplicationDbContext db) : IInquiryService
{
    public async Task<InquiryCreatedDto> CreateAsync(InquiryCreateDto input, CancellationToken cancellationToken)
    {
        var inquiry = new Inquiry { Id = Guid.NewGuid(), Name = input.Name.Trim(), Email = input.Email.Trim().ToLowerInvariant(), Company = input.Company?.Trim(), InquiryType = input.InquiryType.Trim(), Message = input.Message.Trim(), CreatedAt = DateTime.UtcNow };
        db.Inquiries.Add(inquiry);
        await db.SaveChangesAsync(cancellationToken);
        return new InquiryCreatedDto(inquiry.Id, inquiry.Status, inquiry.CreatedAt);
    }

    public async Task<IReadOnlyList<InquiryDto>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Inquiries.AsNoTracking().OrderByDescending(item => item.CreatedAt).Select(item => new InquiryDto(item.Id, item.Name, item.Email, item.Company, item.InquiryType, item.Message, item.Status, item.CreatedAt)).ToListAsync(cancellationToken);

    public async Task<bool> UpdateStatusAsync(Guid id, string status, CancellationToken cancellationToken)
    {
        var inquiry = await db.Inquiries.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (inquiry is null) return false;
        inquiry.Status = status;
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}

using Portfolio.Application.DTOs;

namespace Portfolio.Application.Interfaces;

public interface IInquiryService
{
    Task<InquiryCreatedDto> CreateAsync(InquiryCreateDto input, CancellationToken cancellationToken);
    Task<IReadOnlyList<InquiryDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<bool> UpdateStatusAsync(Guid id, string status, CancellationToken cancellationToken);
}

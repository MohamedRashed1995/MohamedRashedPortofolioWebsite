using System.Threading;
using System.Threading.Tasks;

namespace Portfolio.Application.Interfaces;

public interface IEmailService
{
    Task SendInquiryNotificationAsync(
        string senderName,
        string senderEmail,
        string? company,
        string inquiryType,
        string message,
        CancellationToken ct);
}
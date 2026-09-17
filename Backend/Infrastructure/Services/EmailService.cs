using System;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Portfolio.Application.Interfaces;

namespace Portfolio.Infrastructure.Services;

public sealed class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendInquiryNotificationAsync(
        string senderName,
        string senderEmail,
        string? company,
        string inquiryType,
        string message,
        CancellationToken ct)
    {
        try
        {
            var smtpHost = _config["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.TryParse(_config["EmailSettings:SmtpPort"], out var p) ? p : 587;
            var username = _config["EmailSettings:Username"];
            var appPassword = _config["EmailSettings:AppPassword"];
            var toAddress = _config["EmailSettings:ToAddress"];

            if (string.IsNullOrWhiteSpace(username) ||
                string.IsNullOrWhiteSpace(appPassword) ||
                string.IsNullOrWhiteSpace(toAddress))
            {
                _logger.LogWarning("EmailSettings not configured. Skipping email.");
                return;
            }

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(username, appPassword),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 20000
            };

            var html = new StringBuilder()
                .Append("<h2>New Contact Inquiry</h2>")
                .Append($"<p><strong>Name:</strong> {WebUtility.HtmlEncode(senderName)}</p>")
                .Append($"<p><strong>Email:</strong> {WebUtility.HtmlEncode(senderEmail)}</p>")
                .Append($"<p><strong>Company:</strong> {WebUtility.HtmlEncode(company ?? "-")}</p>")
                .Append($"<p><strong>Type:</strong> {WebUtility.HtmlEncode(inquiryType)}</p>")
                .Append($"<hr/><p>{WebUtility.HtmlEncode(message).Replace("\n", "<br/>")}</p>")
                .ToString();

            using var mail = new MailMessage
            {
                From = new MailAddress(username, "Portfolio Contact"),
                Subject = $"[Portfolio] {inquiryType} - {senderName}",
                Body = html,
                IsBodyHtml = true
            };
            mail.To.Add(toAddress);
            if (!string.IsNullOrWhiteSpace(senderEmail))
                mail.ReplyToList.Add(senderEmail);

            await client.SendMailAsync(mail, ct);
            _logger.LogInformation("Inquiry email sent to {To}", toAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send inquiry email.");
        }
    }
}
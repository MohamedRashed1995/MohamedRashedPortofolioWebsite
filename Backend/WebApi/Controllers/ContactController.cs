using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/v1/contact")]
public sealed class ContactController(IInquiryService inquiries) : ControllerBase
{
    [HttpPost("inquiries")]
    public async Task<ActionResult<InquiryCreatedDto>> CreateInquiry(InquiryCreateDto input, CancellationToken cancellationToken)
    {
        return StatusCode(StatusCodes.Status201Created, await inquiries.CreateAsync(input, cancellationToken));
    }
}

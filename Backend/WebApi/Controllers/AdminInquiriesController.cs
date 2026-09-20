using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/v1/admin/inquiries")]
public sealed class AdminInquiriesController(IInquiryService inquiries) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InquiryDto>>> GetAll(CancellationToken cancellationToken) => Ok(await inquiries.GetAllAsync(cancellationToken));

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, InquiryStatusUpdateDto request, CancellationToken cancellationToken)
    {
        if (request.Status is not ("New" or "Read" or "Archived")) return BadRequest(new { success = false, message = "Unsupported inquiry status." });
        if (!await inquiries.UpdateStatusAsync(id, request.Status, cancellationToken)) return NotFound(new { success = false, message = "Inquiry not found." });
        return NoContent();
    }
}

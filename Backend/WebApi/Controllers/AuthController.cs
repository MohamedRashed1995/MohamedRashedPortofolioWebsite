using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1/admin/auth")]
public sealed class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResultDto>> Login(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var result = await auth.LoginAsync(request.Email, request.Password, cancellationToken);
        return result is null ? Unauthorized(new { success = false, message = "Invalid credentials." }) : Ok(result);
    }
}

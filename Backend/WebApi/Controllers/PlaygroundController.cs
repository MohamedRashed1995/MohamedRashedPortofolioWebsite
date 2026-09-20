using Microsoft.AspNetCore.Mvc;

namespace Portfolio.WebApi.Controllers;

[ApiController]
[Route("api/playground")]
public sealed class PlaygroundController : ControllerBase
{
    [HttpGet("adros/courses")]
    public IActionResult AdrosCourses() => Ok(new { data = new[] { new { id = "c1", title = "Intro to Clean Architecture", enrollments = 1240 }, new { id = "c2", title = "Advanced EF Core", enrollments = 856 } }, total = 2 });

    [HttpGet("helpdesk/tickets")]
    public IActionResult HelpdeskTickets() => Ok(new { data = new[] { new { id = "t1", subject = "Login not working", priority = "High", status = "Open" } }, total = 1 });

    [HttpGet("dentzone/appointments")]
    public IActionResult DentzoneAppointments() => Ok(new { data = Array.Empty<object>(), total = 0 });
}

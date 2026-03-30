using Lyon.Application.Features.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lyon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] Guid? divisionId = null,
        [FromQuery] Guid? projectId = null,
        [FromQuery] string? incidentType = null,
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetSafetyDashboardQuery(
            divisionId, projectId, incidentType, startDate, endDate), ct);
        return Ok(result);
    }
}

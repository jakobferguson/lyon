using Lyon.Application.Features.Recurrence.Commands;
using Lyon.Contracts.Requests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lyon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecurrenceController : ControllerBase
{
    private readonly IMediator _mediator;

    public RecurrenceController(IMediator mediator) => _mediator = mediator;

    [HttpPost("links")]
    public async Task<IActionResult> LinkIncidents([FromBody] CreateRecurrenceLinkRequest request, CancellationToken ct)
    {
        var linkId = await _mediator.Send(new LinkIncidentsCommand(
            request.IncidentAId, request.IncidentBId,
            request.SimilarityTypes, request.Notes), ct);
        return Ok(new { id = linkId });
    }

    [HttpDelete("links/{id:guid}")]
    public async Task<IActionResult> UnlinkIncidents(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new UnlinkIncidentsCommand(id), ct);
        return NoContent();
    }
}

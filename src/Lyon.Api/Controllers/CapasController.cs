using Lyon.Application.Features.Capas.Commands;
using Lyon.Application.Features.Capas.Queries;
using Lyon.Contracts.Requests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lyon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CapasController : ControllerBase
{
    private readonly IMediator _mediator;

    public CapasController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCapaByIdQuery(id), ct);
        return result is not null ? Ok(result) : NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] Guid? assignedToId = null,
        [FromQuery] Guid? incidentId = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetCapaListQuery(
            pageNumber, pageSize, status, priority, assignedToId, incidentId), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCapaRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateCapaCommand(request), ct);
        return CreatedAtAction(null, new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/transition")]
    public async Task<IActionResult> Transition(Guid id, [FromBody] TransitionCapaRequest request, CancellationToken ct)
    {
        var notes = request.CompletionNotes ?? request.VerificationNotes;
        await _mediator.Send(new TransitionCapaCommand(id, request.NewStatus, notes, request.VerifiedById), ct);
        return NoContent();
    }
}

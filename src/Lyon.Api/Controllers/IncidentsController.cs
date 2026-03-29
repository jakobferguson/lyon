using Lyon.Application.Features.Incidents.Commands;
using Lyon.Application.Features.Incidents.Queries;
using Lyon.Contracts.Requests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lyon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncidentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public IncidentsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? incidentType = null,
        [FromQuery] Guid? divisionId = null,
        [FromQuery] string? search = null,
        [FromQuery] string sortBy = "dateTime",
        [FromQuery] bool sortDesc = true,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetIncidentListQuery(
            pageNumber, pageSize, status, incidentType, divisionId, search, sortBy, sortDesc), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetIncidentByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIncidentRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateIncidentCommand(request), ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateIncidentRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateIncidentCommand(id, request), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/transition")]
    public async Task<IActionResult> Transition(Guid id, [FromBody] TransitionStatusRequest request, CancellationToken ct)
    {
        await _mediator.Send(new TransitionIncidentStatusCommand(id, request.NewStatus, request.Reason), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/photos")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> UploadPhoto(Guid id, IFormFile file, CancellationToken ct)
    {
        using var stream = file.OpenReadStream();
        var result = await _mediator.Send(new UploadPhotoCommand(
            id, file.FileName, file.ContentType, file.Length, stream), ct);
        return Ok(result);
    }
}

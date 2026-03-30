using Lyon.Application.Features.Investigations.Commands;
using Lyon.Application.Features.Investigations.Queries;
using Lyon.Contracts.Requests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lyon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvestigationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public InvestigationsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new GetInvestigationListQuery(pageNumber, pageSize, status, search), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetInvestigationByIdQuery(id), ct);
        return result is not null ? Ok(result) : NotFound();
    }

    [HttpGet("by-incident/{incidentId:guid}")]
    public async Task<IActionResult> GetByIncident(Guid incidentId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetInvestigationDetailQuery(incidentId), ct);
        return result is not null ? Ok(result) : NotFound();
    }

    [HttpPost("for-incident/{incidentId:guid}")]
    public async Task<IActionResult> Assign(Guid incidentId, [FromBody] AssignInvestigationRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new AssignInvestigationCommand(
            incidentId, request.LeadInvestigatorId,
            request.TeamMemberIds, request.TargetCompletionDate), ct);
        return CreatedAtAction(nameof(GetByIncident), new { incidentId }, result);
    }

    [HttpPost("{id:guid}/five-why")]
    public async Task<IActionResult> SubmitFiveWhy(Guid id, [FromBody] SubmitFiveWhyRequest request, CancellationToken ct)
    {
        await _mediator.Send(new SubmitFiveWhyCommand(id, request), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/review")]
    public async Task<IActionResult> Review(Guid id, [FromBody] ReviewInvestigationRequest request, CancellationToken ct)
    {
        await _mediator.Send(new ReviewInvestigationCommand(id, request.Action, request.Comments), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/contributing-factors")]
    public async Task<IActionResult> AddContributingFactor(
        Guid id, [FromBody] AddContributingFactorRequest request, CancellationToken ct)
    {
        var factorId = await _mediator.Send(new AddContributingFactorCommand(
            id, request.FactorTypeId, request.IsPrimary, request.Notes), ct);
        return Ok(new { id = factorId });
    }

    [HttpPost("{id:guid}/witness-statements")]
    public async Task<IActionResult> AddWitnessStatement(
        Guid id, [FromBody] AddWitnessStatementRequest request, CancellationToken ct)
    {
        var statementId = await _mediator.Send(new AddWitnessStatementCommand(
            id, request.WitnessName, request.JobTitle, request.Employer,
            request.Phone, request.StatementText, request.CollectionDate,
            request.ReferencesStatementId), ct);
        return Ok(new { id = statementId });
    }
}

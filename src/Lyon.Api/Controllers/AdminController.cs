using Lyon.Application.Features.Admin.Commands;
using Lyon.Application.Features.Admin.Queries;
using Lyon.Contracts.Requests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lyon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator) => _mediator = mediator;

    // Lookup data
    [HttpGet("divisions")]
    public async Task<IActionResult> GetDivisions(CancellationToken ct)
        => Ok(await _mediator.Send(new GetDivisionsQuery(), ct));

    [HttpGet("projects")]
    public async Task<IActionResult> GetProjects([FromQuery] Guid? divisionId, CancellationToken ct)
        => Ok(await _mediator.Send(new GetProjectsQuery(divisionId), ct));

    [HttpGet("railroads")]
    public async Task<IActionResult> GetRailroads(CancellationToken ct)
        => Ok(await _mediator.Send(new GetRailroadsQuery(), ct));

    [HttpGet("factor-types")]
    public async Task<IActionResult> GetFactorTypes(CancellationToken ct)
        => Ok(await _mediator.Send(new GetFactorTypesQuery(), ct));

    // Management
    [HttpPost("factor-types")]
    public async Task<IActionResult> CreateFactorType([FromBody] UpsertFactorTypeRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpsertFactorTypeCommand(
            null, request.Category, request.Name, request.Description, request.SortOrder), ct);
        return Ok(result);
    }

    [HttpPut("factor-types/{id:guid}")]
    public async Task<IActionResult> UpdateFactorType(Guid id, [FromBody] UpsertFactorTypeRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpsertFactorTypeCommand(
            id, request.Category, request.Name, request.Description, request.SortOrder), ct);
        return Ok(result);
    }

    [HttpPut("hours-worked")]
    public async Task<IActionResult> UpsertHoursWorked([FromBody] UpsertHoursWorkedRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpsertHoursWorkedCommand(
            request.Year, request.Month, request.DivisionId, request.Hours), ct);
        return NoContent();
    }

    // Audit log
    [HttpGet("audit-log")]
    public async Task<IActionResult> GetAuditLog(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? entityType = null,
        [FromQuery] Guid? entityId = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAuditLogQuery(
            pageNumber, pageSize, entityType, entityId, action, startDate, endDate), ct);
        return Ok(result);
    }
}

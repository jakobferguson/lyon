using Lyon.Application.Features.Reports.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lyon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("incidents/{id:guid}/pdf")]
    public async Task<IActionResult> GenerateIncidentPdf(Guid id, CancellationToken ct)
    {
        var pdf = await _mediator.Send(new GenerateIncidentPdfQuery(id), ct);
        return File(pdf, "application/pdf", $"incident-{id}.pdf");
    }
}

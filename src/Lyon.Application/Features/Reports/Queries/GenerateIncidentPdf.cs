using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Domain.Enums;
using MediatR;

namespace Lyon.Application.Features.Reports.Queries;

[Authorize(UserRole.SafetyCoordinator)]
public record GenerateIncidentPdfQuery(Guid IncidentId) : IRequest<byte[]>;

public class GenerateIncidentPdfQueryHandler : IRequestHandler<GenerateIncidentPdfQuery, byte[]>
{
    private readonly IPdfGenerationService _pdfService;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public GenerateIncidentPdfQueryHandler(
        IPdfGenerationService pdfService,
        ICurrentUserService currentUser,
        IAuditLogService audit)
    {
        _pdfService = pdfService;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<byte[]> Handle(GenerateIncidentPdfQuery query, CancellationToken ct)
    {
        var includeMedical = _currentUser.CanAccessMedicalData();

        var pdf = await _pdfService.GenerateIncidentReportAsync(query.IncidentId, includeMedical, ct);

        await _audit.LogAsync(
            AuditAction.PdfGenerate,
            "Incident",
            query.IncidentId,
            cancellationToken: ct);

        return pdf;
    }
}

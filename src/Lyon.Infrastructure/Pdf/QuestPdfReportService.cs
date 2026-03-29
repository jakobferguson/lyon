using Lyon.Application.Common.Interfaces;

namespace Lyon.Infrastructure.Pdf;

public class QuestPdfReportService : IPdfGenerationService
{
    private readonly IApplicationDbContext _db;

    public QuestPdfReportService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<byte[]> GenerateIncidentReportAsync(Guid incidentId, bool includeMedicalData, CancellationToken cancellationToken = default)
    {
        // QuestPDF implementation placeholder
        // Full implementation would use QuestPDF Document.Create() to build the 13-section report
        await Task.CompletedTask;

        return "Lyon Incident Report PDF Placeholder"u8.ToArray();
    }
}

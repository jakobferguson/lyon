namespace Lyon.Application.Common.Interfaces;

public interface IPdfGenerationService
{
    Task<byte[]> GenerateIncidentReportAsync(Guid incidentId, bool includeMedicalData, CancellationToken cancellationToken = default);
}

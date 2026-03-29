using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Investigations.Queries;

[Authorize(UserRole.SafetyCoordinator)]
public record GetInvestigationByIdQuery(Guid InvestigationId) : IRequest<InvestigationDetailResponse?>;

public class GetInvestigationByIdQueryHandler : IRequestHandler<GetInvestigationByIdQuery, InvestigationDetailResponse?>
{
    private readonly IApplicationDbContext _db;

    public GetInvestigationByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<InvestigationDetailResponse?> Handle(GetInvestigationByIdQuery query, CancellationToken ct)
    {
        var investigation = await _db.Investigations
            .Include(i => i.LeadInvestigator)
            .Include(i => i.AssignedBy)
            .Include(i => i.ReviewedBy)
            .Include(i => i.TeamMembers).ThenInclude(tm => tm.User)
            .Include(i => i.FiveWhyEntries)
            .Include(i => i.ContributingFactors).ThenInclude(cf => cf.FactorType)
            .Include(i => i.WitnessStatements).ThenInclude(ws => ws.CollectedBy)
            .Where(i => i.Id == query.InvestigationId && !i.IsDeleted)
            .FirstOrDefaultAsync(ct);

        if (investigation is null) return null;

        return new InvestigationDetailResponse
        {
            Id = investigation.Id,
            IncidentId = investigation.IncidentId,
            LeadInvestigator = investigation.LeadInvestigator.DisplayName,
            LeadInvestigatorId = investigation.LeadInvestigatorId,
            AssignedBy = investigation.AssignedBy.DisplayName,
            TargetCompletionDate = investigation.TargetCompletionDate,
            ActualCompletionDate = investigation.ActualCompletionDate,
            RootCauseSummary = investigation.RootCauseSummary,
            Status = investigation.Status.ToString(),
            ReviewComments = investigation.ReviewComments,
            ReviewedBy = investigation.ReviewedBy?.DisplayName,
            ReviewedAt = investigation.ReviewedAt,
            InvestigationNumber = investigation.InvestigationNumber,
            CreatedAt = investigation.CreatedAt,
            TeamMembers = investigation.TeamMembers.Select(tm => new TeamMemberResponse
            {
                UserId = tm.UserId,
                DisplayName = tm.User.DisplayName,
                Email = tm.User.Email,
            }).ToList(),
            FiveWhyEntries = investigation.FiveWhyEntries.OrderBy(e => e.Level).Select(e => new FiveWhyEntryResponse
            {
                Id = e.Id,
                Level = e.Level,
                WhyQuestion = e.WhyQuestion,
                Answer = e.Answer,
                SupportingEvidence = e.SupportingEvidence,
            }).ToList(),
            ContributingFactors = investigation.ContributingFactors.Select(cf => new ContributingFactorResponse
            {
                Id = cf.Id,
                FactorTypeId = cf.FactorTypeId,
                FactorCategory = cf.FactorType.Category.ToString(),
                FactorName = cf.FactorType.Name,
                IsPrimary = cf.IsPrimary,
                Notes = cf.Notes,
            }).ToList(),
            WitnessStatements = investigation.WitnessStatements.OrderBy(ws => ws.CreatedAt).Select(ws => new WitnessStatementResponse
            {
                Id = ws.Id,
                WitnessName = ws.WitnessName,
                JobTitle = ws.JobTitle,
                Employer = ws.Employer,
                Phone = ws.Phone,
                StatementText = ws.StatementText,
                CollectionDate = ws.CollectionDate,
                CollectedBy = ws.CollectedBy.DisplayName,
                ReferencesStatementId = ws.ReferencesStatementId,
                CreatedAt = ws.CreatedAt,
            }).ToList(),
        };
    }
}

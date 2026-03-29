namespace Lyon.Domain.Enums;

public enum IncidentStatus
{
    Draft,
    Reported,
    UnderInvestigation,
    InvestigationComplete,
    InvestigationApproved,
    CapaAssigned,
    CapaInProgress,
    Closed,
    Reopened
}

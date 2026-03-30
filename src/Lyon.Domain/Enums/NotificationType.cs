namespace Lyon.Domain.Enums;

public enum NotificationType
{
    NewIncident,
    InvestigationAssigned,
    InvestigationOverdue3Days,
    InvestigationOverdue7Days,
    InvestigationOverdue14Days,
    InvestigationReturned,
    InvestigationApproved,
    CapaAssigned,
    CapaOverdue,
    CapaVerificationDue,
    CapaVerifiedIneffective,
    RailroadNotificationOverdue
}

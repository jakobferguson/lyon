namespace Lyon.Application.Common.Interfaces;

public interface IBackgroundJobScheduler
{
    void EnqueueCheckOverdueInvestigations();
    void EnqueueCheckOverdueCapas();
    void EnqueueCheckRailroadNotificationDeadlines();
}

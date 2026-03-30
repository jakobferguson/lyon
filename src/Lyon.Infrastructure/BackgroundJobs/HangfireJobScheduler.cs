using Lyon.Application.Common.Interfaces;

namespace Lyon.Infrastructure.BackgroundJobs;

public class HangfireJobScheduler : IBackgroundJobScheduler
{
    public void EnqueueCheckOverdueInvestigations()
    {
        // Hangfire.BackgroundJob.Enqueue<OverdueInvestigationChecker>(x => x.ExecuteAsync(CancellationToken.None));
    }

    public void EnqueueCheckOverdueCapas()
    {
        // Hangfire.BackgroundJob.Enqueue<OverdueCapaChecker>(x => x.ExecuteAsync(CancellationToken.None));
    }

    public void EnqueueCheckRailroadNotificationDeadlines()
    {
        // Hangfire.BackgroundJob.Enqueue<RailroadNotificationDeadlineChecker>(x => x.ExecuteAsync(CancellationToken.None));
    }
}

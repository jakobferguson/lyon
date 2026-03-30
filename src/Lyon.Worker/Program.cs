using Hangfire;
using Hangfire.PostgreSql;
using Lyon.Application;
using Lyon.Infrastructure;
using Lyon.Infrastructure.BackgroundJobs.Jobs;
using Serilog;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddSerilog(config =>
    config.ReadFrom.Configuration(builder.Configuration));

// Application + Infrastructure (includes DbContext, services)
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Hangfire
builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")!)));

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 2;
    options.Queues = ["default", "escalation"];
});

// Register job classes
builder.Services.AddScoped<OverdueInvestigationChecker>();
builder.Services.AddScoped<OverdueCapaChecker>();
builder.Services.AddScoped<RailroadNotificationDeadlineChecker>();

var host = builder.Build();

// Register recurring jobs
using (var scope = host.Services.CreateScope())
{
    var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();

    recurringJobManager.AddOrUpdate<OverdueInvestigationChecker>(
        "overdue-investigation-check",
        job => job.ExecuteAsync(CancellationToken.None),
        "*/15 * * * *"); // Every 15 minutes

    recurringJobManager.AddOrUpdate<OverdueCapaChecker>(
        "overdue-capa-check",
        job => job.ExecuteAsync(CancellationToken.None),
        "*/15 * * * *"); // Every 15 minutes

    recurringJobManager.AddOrUpdate<RailroadNotificationDeadlineChecker>(
        "railroad-notification-deadline-check",
        job => job.ExecuteAsync(CancellationToken.None),
        "*/5 * * * *"); // Every 5 minutes
}

host.Run();

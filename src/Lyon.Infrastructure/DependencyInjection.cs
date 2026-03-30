using Lyon.Application.Common.Interfaces;
using Lyon.Infrastructure.BackgroundJobs;
using Lyon.Infrastructure.GeoLocation;
using Lyon.Infrastructure.Identity;
using Lyon.Infrastructure.Notifications;
using Lyon.Infrastructure.Pdf;
using Lyon.Infrastructure.Persistence;
using Lyon.Infrastructure.Persistence.Interceptors;
using Lyon.Infrastructure.Security;
using Lyon.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Lyon.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // EF Core + PostgreSQL
        services.AddSingleton<AuditableEntityInterceptor>();
        services.AddSingleton<SoftDeleteInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql =>
                {
                    npgsql.UseNetTopologySuite();
                    npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                });
            options.AddInterceptors(
                sp.GetRequiredService<AuditableEntityInterceptor>(),
                sp.GetRequiredService<SoftDeleteInterceptor>());
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // Services
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddSingleton<IEncryptionService, AesEncryptionService>();
        services.AddSingleton<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<INotificationService, InAppNotificationService>();
        services.AddScoped<IGeoLocationService, GeofenceService>();
        services.AddScoped<IPdfGenerationService, QuestPdfReportService>();
        services.AddSingleton<IBackgroundJobScheduler, HangfireJobScheduler>();

        return services;
    }
}

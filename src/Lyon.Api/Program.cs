using Lyon.Api.Configuration;
using Lyon.Api.Middleware;
using Lyon.Application;
using Lyon.Infrastructure;
using Lyon.Infrastructure.Persistence.Seeding;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// Application + Infrastructure
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// API services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddLyonSwagger();
builder.Services.AddLyonCors(builder.Configuration);

// Auth — skip in Development when SKIP_AUTH=true for local dev
if (builder.Configuration.GetValue<bool>("SkipAuth"))
{
    builder.Services.AddAuthentication()
        .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, Lyon.Api.DevAuthHandler>(
            "Bearer", _ => { });
    builder.Services.AddAuthorization();
}
else
{
    builder.Services.AddLyonAuthentication(builder.Configuration);
    builder.Services.AddLyonAuthorization();
}

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("LyonCors");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<RequestAuditMiddleware>();

app.MapControllers();

// Auto-migrate and seed in development
if (app.Environment.IsDevelopment())
{
    await DatabaseSeeder.SeedAsync(app.Services);
}

app.Run();

// Make Program accessible for integration tests
public partial class Program { }

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS base
WORKDIR /app
USER $APP_UID

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution and project files
COPY Directory.Build.props .
COPY Directory.Packages.props .
COPY src/Lyon.Domain/Lyon.Domain.csproj src/Lyon.Domain/
COPY src/Lyon.Contracts/Lyon.Contracts.csproj src/Lyon.Contracts/
COPY src/Lyon.Application/Lyon.Application.csproj src/Lyon.Application/
COPY src/Lyon.Infrastructure/Lyon.Infrastructure.csproj src/Lyon.Infrastructure/
COPY src/Lyon.Worker/Lyon.Worker.csproj src/Lyon.Worker/

# Restore
RUN dotnet restore src/Lyon.Worker/Lyon.Worker.csproj

# Copy everything and build
COPY src/ src/
RUN dotnet build src/Lyon.Worker/Lyon.Worker.csproj -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish src/Lyon.Worker/Lyon.Worker.csproj -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Lyon.Worker.dll"]

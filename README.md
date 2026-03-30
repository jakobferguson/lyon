# Lyon — SRD-10 Incident Investigation & Corrective Action System

Lyon is an internal web application built for Herzog, a North American rail and heavy/highway infrastructure contractor. It serves as the centralized platform for railroad incident reporting, 5-Why root cause investigation, corrective and preventive action (CAPA) management, and safety performance dashboards — covering TRIR, DART, and leading indicator metrics. The system supports approximately 5,000 users across Herzog's seven divisions operating in the United States, Canada, and Mexico, with role-based access control ranging from field reporters to executives and full HIPAA compliance for medical data handling.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **State / Data:** TanStack Query, Zustand
- **Routing:** React Router v7
- **Auth:** Azure AD SSO (MSAL)
- **Backend:** ASP.NET Core 8 Web API (separate repo)
- **Database:** PostgreSQL + PostGIS

## Repository Structure

```
lyon/
  frontend/      # React + TypeScript + Vite application
  backend/       # ASP.NET Core 8 Web API (coming soon)
  README.md
  FrontEndPlan.md
  ExtendedRequirements.md
```

## Getting Started (Frontend)

### Option 1 — Local Node

```bash
cd frontend
cp .env.example .env   # configure environment variables
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

### Option 2 — Docker

Requires [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).

```bash
# Build and run all services (frontend, API, worker, database)
docker compose up --build

# Or run in the background
docker compose up --build -d
```

This starts four services:

| Service | URL | Description |
|---------|-----|-------------|
| **lyon-client** | `http://localhost:3000` | React frontend (nginx) |
| **lyon-api** | `http://localhost:5000` | ASP.NET Core Web API |
| **lyon-worker** | — | Background worker |
| **db** | `localhost:5432` | PostgreSQL + PostGIS |

To stop all services:

```bash
docker compose down

# To also remove the database volume:
docker compose down -v
```

## Frontend Structure

```
frontend/src/
  app/           # Providers, router, auth
  components/    # Shared UI components and layouts
  config/        # App-level constants
  features/      # Feature modules (incidents, investigations, capas, dashboard, admin)
  hooks/         # Shared hooks
  lib/           # Library configuration (React Query, MSAL)
  stores/        # Zustand stores
  types/         # Global TypeScript types
  utils/         # Utility functions
```

See `FrontEndPlan.md` for the full phased build plan.

# Lyon — SRD-10 Incident Investigation & Corrective Action System

Lyon is an internal web application built for Herzog, a North American rail and heavy/highway infrastructure contractor. It serves as the centralized platform for railroad incident reporting, 5-Why root cause investigation, corrective and preventive action (CAPA) management, and safety performance dashboards — covering TRIR, DART, and leading indicator metrics. The system supports approximately 5,000 users across Herzog's seven divisions operating in the United States, Canada, and Mexico, with role-based access control ranging from field reporters to executives and full HIPAA compliance for medical data handling.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **State / Data:** TanStack Query, Zustand
- **Routing:** React Router v7
- **Auth:** Azure AD SSO (MSAL)
- **Backend:** ASP.NET Core 8 Web API (separate repo)
- **Database:** PostgreSQL + PostGIS

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  app/           # Providers, router
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

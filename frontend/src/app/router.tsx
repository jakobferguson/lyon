import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ComingSoon } from '../components/ui';
import { AppShell } from '../components/layouts/AppShell/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

// Public routes
import { LandingRoute } from '../features/landing/routes/LandingRoute';
import { DevLoginRoute } from '../features/dev-login/routes/DevLoginRoute';

// Incidents (Phase 2)
import { IncidentListRoute } from '../features/incidents/routes/IncidentListRoute';
import { NewIncidentRoute } from '../features/incidents/routes/NewIncidentRoute';
import { IncidentDetailRoute } from '../features/incidents/routes/IncidentDetailRoute';

// Investigations (Phase 3)
import { InvestigationListRoute } from '../features/investigations/routes/InvestigationListRoute';
import { InvestigationDetailRoute } from '../features/investigations/routes/InvestigationDetailRoute';

// CAPAs (Phase 4)
import { CapaListRoute } from '../features/capas/routes/CapaListRoute';
import { NewCapaRoute }  from '../features/capas/routes/NewCapaRoute';
import { CapaDetailRoute } from '../features/capas/routes/CapaDetailRoute';

// Dashboard (Phase 5)
import { DashboardRoute } from '../features/dashboard/routes/DashboardRoute';

function Placeholder({ name }: { name: string }) {
  return <ComingSoon name={name} />;
}

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true';

export const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────────────────
  {
    path: '/',
    element: <LandingRoute />,
  },
  ...(DEV_AUTH
    ? [{ path: '/dev-login', element: <DevLoginRoute /> }]
    : []),

  // ── Protected app shell ──────────────────────────────────────────────────
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },

          // Dashboard (Phase 5)
          { path: 'dashboard', element: <DashboardRoute /> },

          // Incidents (Phase 2)
          { path: 'incidents',       element: <IncidentListRoute /> },
          { path: 'incidents/new',   element: <NewIncidentRoute /> },
          { path: 'incidents/:id',   element: <IncidentDetailRoute /> },

          // Investigations (Phase 3 — Safety Coordinator+)
          {
            path: 'investigations',
            element: <ProtectedRoute requiredRole="safety_coordinator" />,
            children: [
              { index: true, element: <InvestigationListRoute /> },
              { path: ':id', element: <InvestigationDetailRoute /> },
            ],
          },

          // CAPAs (Phase 4 — Safety Coordinator+)
          {
            path: 'capas',
            element: <ProtectedRoute requiredRole="safety_coordinator" />,
            children: [
              { index: true,    element: <CapaListRoute /> },
              { path: 'new',    element: <NewCapaRoute /> },
              { path: ':id',    element: <CapaDetailRoute /> },
            ],
          },

          // Admin (Safety Manager+)
          {
            path: 'admin',
            element: <ProtectedRoute requiredRole="safety_manager" />,
            children: [
              { index: true,              element: <Placeholder name="Admin" /> },
              { path: 'railroads',        element: <Placeholder name="Railroad Rules" /> },
              { path: 'factors',          element: <Placeholder name="Factor Types" /> },
              { path: 'shifts',           element: <Placeholder name="Shift Windows" /> },
              { path: 'hours',            element: <Placeholder name="Hours Worked" /> },
              { path: 'geofences',        element: <Placeholder name="Geofences" /> },
              { path: 'users',            element: <Placeholder name="User Management" /> },
              { path: 'audit-log',        element: <Placeholder name="Audit Log" /> },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);

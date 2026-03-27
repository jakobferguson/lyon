import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ComingSoon } from '../components/ui';
import { AppShell } from '../components/layouts/AppShell/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

// Public routes
import { LandingRoute } from '../features/landing/routes/LandingRoute';
import { DevLoginRoute } from '../features/dev-login/routes/DevLoginRoute';

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

          // Dashboard
          { path: 'dashboard', element: <Placeholder name="Dashboard" /> },

          // Incidents
          { path: 'incidents',       element: <Placeholder name="Incidents" /> },
          { path: 'incidents/new',   element: <Placeholder name="New Incident" /> },
          { path: 'incidents/:id',   element: <Placeholder name="Incident Detail" /> },

          // Investigations (Safety Coordinator+)
          {
            path: 'investigations',
            element: <ProtectedRoute requiredRole="safety_coordinator" />,
            children: [
              { index: true,    element: <Placeholder name="Investigations" /> },
              { path: ':id',    element: <Placeholder name="Investigation Detail" /> },
            ],
          },

          // CAPAs (Safety Coordinator+)
          {
            path: 'capas',
            element: <ProtectedRoute requiredRole="safety_coordinator" />,
            children: [
              { index: true,    element: <Placeholder name="CAPAs" /> },
              { path: 'new',    element: <Placeholder name="New CAPA" /> },
              { path: ':id',    element: <Placeholder name="CAPA Detail" /> },
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

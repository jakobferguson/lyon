import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePermission } from '../hooks/usePermission';
import type { Role } from '../types';
import { ComingSoon } from '../components/ui';

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true';

interface ProtectedRouteProps {
  requiredRole?: Role;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasPermission = usePermission(requiredRole ?? 'field_reporter');

  if (!isAuthenticated) {
    return <Navigate to={DEV_AUTH ? '/dev-login' : '/'} replace />;
  }

  if (requiredRole && !hasPermission) {
    return <ComingSoon name="Access Denied" />;
  }

  return <Outlet />;
}

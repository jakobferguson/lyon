import { useAuthStore } from '../stores/authStore';
import type { Role } from '../types';

const ROLE_HIERARCHY: Record<Role, number> = {
  field_reporter:     1,
  project_manager:    2,
  division_manager:   3,
  executive:          4,
  safety_coordinator: 5,
  safety_manager:     6,
  admin:              7,
};

/**
 * Returns true if the current user's role meets or exceeds the required role.
 * Pass an exact role string, or use the numeric hierarchy for "at least X" checks.
 */
export function usePermission(requiredRole: Role): boolean {
  const role = useAuthStore((s) => s.role);
  if (!role) return false;
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole];
}

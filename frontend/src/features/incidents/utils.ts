import type { BadgeVariant } from '../../components/ui';
import type { IncidentStatus } from './types';

export const STATUS_VARIANT: Record<IncidentStatus, BadgeVariant> = {
  'Draft':                  'neutral',
  'Reported':               'info',
  'Under Investigation':    'pending',
  'Investigation Complete': 'pending',
  'Investigation Approved': 'active',
  'CAPA Assigned':          'pending',
  'CAPA In Progress':       'pending',
  'Closed':                 'active',
  'Reopened':               'overdue',
};

/** Short format for table rows: "Mar 10, 2026, 8:30 AM" */
export function formatDateShort(dt: string): string {
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

/** Long format for detail headers: "Monday, March 10, 2026 at 8:30 AM CDT" */
export function formatDateLong(dt: string): string {
  return new Date(dt).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
}

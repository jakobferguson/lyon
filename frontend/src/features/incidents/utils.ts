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

// Date formatting (re-exported from shared utils)
export { formatDateShort, formatDateLong } from '../../utils/dates';

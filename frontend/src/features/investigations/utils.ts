import type { BadgeVariant } from '../../components/ui';
import type { Severity } from '../incidents/types';
import type { InvestigationStatus } from './types';

// ── Status badge map ──────────────────────────────────────────────────────

export const INVESTIGATION_STATUS_VARIANT: Record<InvestigationStatus, BadgeVariant> = {
  'Assigned':    'info',
  'In Progress': 'pending',
  'Complete':    'pending',
  'Approved':    'active',
  'Returned':    'overdue',
};

// ── Target date calculation (§4.1) ────────────────────────────────────────

const BUSINESS_DAYS_MS = (days: number) => {
  // Approximation for display: 1 business day ≈ 1 calendar day
  // Real implementation would skip weekends; this is sufficient for frontend seed display.
  return days * 24 * 60 * 60 * 1000;
};

export function calculateTargetDate(severity: Severity, incidentDateTime: string): Date {
  const base = new Date(incidentDateTime);
  switch (severity) {
    case 'Fatality':
      return new Date(base.getTime() + 48 * 60 * 60 * 1000);
    case 'Lost Time':
      return new Date(base.getTime() + BUSINESS_DAYS_MS(5));
    case 'Medical Treatment':
      return new Date(base.getTime() + BUSINESS_DAYS_MS(10));
    case 'First Aid':
    case 'Near Miss':
    default:
      return new Date(base.getTime() + 14 * 24 * 60 * 60 * 1000);
  }
}

// ── Overdue calculation ───────────────────────────────────────────────────

export type EscalationTier = 'none' | 'tier1' | 'tier2' | 'tier3';

/**
 * Returns the escalation tier based on how many days past the target date.
 * tier1 = +3d  (badge on panel)
 * tier2 = +7d  (in-page warning banner)
 * tier3 = +14d (persistent app banner)
 */
export function getEscalationTier(targetDate: string, status: InvestigationStatus): EscalationTier {
  if (status === 'Approved') return 'none';

  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const overdueDays = (now - target) / (24 * 60 * 60 * 1000);

  if (overdueDays >= 14) return 'tier3';
  if (overdueDays >= 7)  return 'tier2';
  if (overdueDays >= 3)  return 'tier1';
  return 'none';
}

export function getDaysOverdue(targetDate: string): number {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  return Math.floor((now - target) / (24 * 60 * 60 * 1000));
}

// ── Date formatting ───────────────────────────────────────────────────────

export function formatDateShort(dt: string): string {
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function formatDateOnly(dt: string): string {
  return new Date(dt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatDateLong(dt: string): string {
  return new Date(dt).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
}

import type { BadgeVariant } from '../../components/ui';
import type { Capa, CapaPriority, CapaStatus } from './types';

// ── Status badge map ──────────────────────────────────────────────────────

export const CAPA_STATUS_VARIANT: Record<CapaStatus, BadgeVariant> = {
  'Open':                  'info',
  'In Progress':           'pending',
  'Completed':             'pending',
  'Verification Pending':  'pending',
  'Verified Effective':    'active',
  'Verified Ineffective':  'overdue',
};

// ── Priority badge map ────────────────────────────────────────────────────

export const PRIORITY_VARIANT: Record<CapaPriority, BadgeVariant> = {
  Critical: 'overdue',
  High:     'pending',
  Medium:   'info',
  Low:      'neutral',
};

// ── Due date calculation (§5.1) ───────────────────────────────────────────

const ACTION_DAYS: Record<CapaPriority, number> = {
  Critical: 7,
  High:     14,
  Medium:   30,
  Low:      60,
};

const VERIFICATION_DAYS: Record<CapaPriority, number> = {
  Critical: 30,
  High:     60,
  Medium:   90,
  Low:      90,
};

export function calculateDueDate(priority: CapaPriority, fromDate: Date = new Date()): Date {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + ACTION_DAYS[priority]);
  return d;
}

export function calculateVerificationDueDate(priority: CapaPriority, completionDate: Date = new Date()): Date {
  const d = new Date(completionDate);
  d.setDate(d.getDate() + VERIFICATION_DAYS[priority]);
  return d;
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ── Overdue detection ─────────────────────────────────────────────────────

const CLOSED_STATUSES: CapaStatus[] = ['Verified Effective', 'Verified Ineffective'];

export function isOverdue(capa: Capa): boolean {
  if (CLOSED_STATUSES.includes(capa.status)) return false;
  return Date.now() > new Date(capa.dueDate).getTime();
}

// ── Age bucket ────────────────────────────────────────────────────────────

export type AgeBucket = '<7d' | '7–14d' | '14–30d' | '30–60d' | '>60d';

export function getAgeBucket(createdAt: string): AgeBucket {
  const days = (Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000);
  if (days < 7)  return '<7d';
  if (days < 14) return '7–14d';
  if (days < 30) return '14–30d';
  if (days < 60) return '30–60d';
  return '>60d';
}

// ── KPI calculations ──────────────────────────────────────────────────────

export function computeKpis(capas: Capa[]) {
  const open     = capas.filter((c) => !CLOSED_STATUSES.includes(c.status)).length;
  const overdue  = capas.filter(isOverdue).length;

  const verified = capas.filter((c) => c.status === 'Verified Effective' || c.status === 'Verified Ineffective');
  const effective = capas.filter((c) => c.status === 'Verified Effective');

  const effectivenessRate = verified.length > 0
    ? Math.round((effective.length / verified.length) * 100)
    : null;

  const closedWithTime = effective.filter((c) => c.completedAt);
  const avgCloseDays = closedWithTime.length > 0
    ? Math.round(
        closedWithTime.reduce((sum, c) => {
          const days = (new Date(c.completedAt!).getTime() - new Date(c.createdAt).getTime()) / (24 * 60 * 60 * 1000);
          return sum + days;
        }, 0) / closedWithTime.length,
      )
    : null;

  return { open, overdue, effectivenessRate, avgCloseDays };
}

// ── Date formatting (re-exported from shared utils) ──────────────────────

export { formatDateShort, formatDateOnly } from '../../utils/dates';

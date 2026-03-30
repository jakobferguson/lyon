import type { MonthlyIncidentRecord, DashboardFilters } from './types';

// ── TRIR / DART ───────────────────────────────────────────────────────────

/** OSHA standard: rates are per 200,000 hours worked (100 full-time employees × 2,000 hrs/yr). */
const OSHA_HOURS_FACTOR = 200_000;

export function calcTrir(recordableCount: number, hoursWorked: number): number {
  if (hoursWorked === 0) return 0;
  return (recordableCount * OSHA_HOURS_FACTOR) / hoursWorked;
}

export function calcDart(dartCases: number, hoursWorked: number): number {
  if (hoursWorked === 0) return 0;
  return (dartCases * OSHA_HOURS_FACTOR) / hoursWorked;
}

export function formatRate(rate: number): string {
  return rate.toFixed(2);
}

// ── Filter monthly data ───────────────────────────────────────────────────

export function filterMonthly(
  records: MonthlyIncidentRecord[],
  filters: DashboardFilters,
): MonthlyIncidentRecord[] {
  return records.filter((r) => {
    if (filters.dateFrom && r.month < filters.dateFrom.slice(0, 7)) return false;
    if (filters.dateTo   && r.month > filters.dateTo.slice(0, 7))   return false;
    return true;
  });
}

// ── KPI data shape ───────────────────────────────────────────────────────

export interface KpiData {
  trir:             number | null;
  trirPrev:         number | null;
  dartRate:         number | null;
  dartRatePrev:     number | null;
  nearMissRatio:    number | null;
  openInvestigations: number;
  openCapas:        number;
  lostWorkDaysYtd:  number;
  hoursAvailable:   boolean;
}

// ── Trend direction ───────────────────────────────────────────────────────

export type TrendDirection = 'up' | 'down' | 'flat';

export function getTrend(current: number | null, prev: number | null): TrendDirection {
  if (current === null || prev === null || prev === 0) return 'flat';
  const delta = current - prev;
  if (Math.abs(delta) < 0.01) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

// ── TRIR trend chart data ─────────────────────────────────────────────────

export interface TrirDataPoint {
  label: string;
  trir: number;
  benchmark: number;
}

export function buildTrirTrendData(
  records: MonthlyIncidentRecord[],
  hoursPerMonth: number,
  benchmark: number,
): TrirDataPoint[] {
  return records.map((r) => ({
    label:     r.label,
    trir:      parseFloat(calcTrir(r.totalRecordable, hoursPerMonth).toFixed(2)),
    benchmark,
  }));
}

// ── Leading indicators ────────────────────────────────────────────────────

export interface LeadingIndicator {
  label: string;
  actual: number;
  target: number;
  unit: string;
  onTrack: boolean;
  description: string;
}

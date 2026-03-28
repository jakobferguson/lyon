import type { MonthlyIncidentRecord, DashboardFilters, HoursWorkedEntry, SeverityRecord } from './types';
import { MONTHLY_INCIDENT_SEED, HOURS_WORKED_SEED } from './types';
import { INVESTIGATION_SEED } from '../investigations/types';
import { CAPA_SEED } from '../capas/types';
import { INCIDENT_SEED } from '../incidents/types';

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

// ── KPI computations ──────────────────────────────────────────────────────

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

export function computeKpiData(filters: DashboardFilters, hoursEntries: HoursWorkedEntry[] = HOURS_WORKED_SEED): KpiData {
  const filtered   = filterMonthly(MONTHLY_INCIDENT_SEED, filters);
  const totalHours = hoursEntries.reduce((s, h) => s + h.companyWide, 0);
  const hoursAvailable = totalHours > 0;

  const totalRecordable = filtered.reduce((s, r) => s + r.totalRecordable, 0);
  const totalDart       = filtered.reduce((s, r) => s + r.dartCases, 0);
  const totalNearMiss   = filtered.reduce((s, r) => s + r['Near Miss'], 0);
  const lostWorkDaysYtd = filtered.reduce((s, r) => s + r.lostWorkDays, 0);

  // Prior period: same number of months, shifted back
  const prevFiltered = getPriorPeriod(filters);
  const prevRecordable = prevFiltered.reduce((s, r) => s + r.totalRecordable, 0);
  const prevDart       = prevFiltered.reduce((s, r) => s + r.dartCases, 0);

  const trir     = hoursAvailable ? calcTrir(totalRecordable, totalHours) : null;
  const dartRate = hoursAvailable ? calcDart(totalDart, totalHours) : null;
  const trirPrev = hoursAvailable ? calcTrir(prevRecordable, totalHours) : null;
  const dartRatePrev = hoursAvailable ? calcDart(prevDart, totalHours) : null;

  const nearMissRatio = totalRecordable > 0
    ? Math.round((totalNearMiss / totalRecordable) * 10) / 10
    : null;

  const openInvestigations = INVESTIGATION_SEED.filter(
    (inv) => inv.status !== 'Approved',
  ).length;

  const openCapas = CAPA_SEED.filter(
    (c) => c.status !== 'Verified Effective' && c.status !== 'Verified Ineffective',
  ).length;

  return {
    trir, trirPrev, dartRate, dartRatePrev, nearMissRatio,
    openInvestigations, openCapas, lostWorkDaysYtd, hoursAvailable,
  };
}

function getPriorPeriod(filters: DashboardFilters): MonthlyIncidentRecord[] {
  // Shift date range back by the same number of months
  const from = new Date(filters.dateFrom);
  const to   = new Date(filters.dateTo);
  const diffMs = to.getTime() - from.getTime();
  const prevTo   = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - diffMs);
  return filterMonthly(MONTHLY_INCIDENT_SEED, {
    ...filters,
    dateFrom: prevFrom.toISOString().slice(0, 10),
    dateTo:   prevTo.toISOString().slice(0, 10),
  });
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

export function computeLeadingIndicators(): LeadingIndicator[] {
  const filtered = MONTHLY_INCIDENT_SEED;
  const totalNearMiss   = filtered.reduce((s, r) => s + r['Near Miss'], 0);
  const totalRecordable = filtered.reduce((s, r) => s + r.totalRecordable, 0);
  const nearMissRate = totalRecordable > 0
    ? parseFloat((totalNearMiss / totalRecordable).toFixed(1))
    : 0;

  const totalCapas = CAPA_SEED.length;
  const closedCapas = CAPA_SEED.filter(
    (c) => c.status === 'Verified Effective' || c.status === 'Verified Ineffective',
  ).length;
  const capaClosureRate = totalCapas > 0
    ? Math.round((closedCapas / totalCapas) * 100)
    : 0;

  const totalInv = INVESTIGATION_SEED.length;
  const onTimeInv = INVESTIGATION_SEED.filter((inv) => inv.status === 'Approved').length;
  const invTimeliness = totalInv > 0
    ? Math.round((onTimeInv / totalInv) * 100)
    : 0;

  return [
    {
      label:       'Near Miss Reporting Rate',
      actual:      nearMissRate,
      target:      3.0,
      unit:        'ratio',
      onTrack:     nearMissRate >= 3.0,
      description: 'Near miss reports per recordable incident',
    },
    {
      label:       'CAPA Closure Rate',
      actual:      capaClosureRate,
      target:      80,
      unit:        '%',
      onTrack:     capaClosureRate >= 80,
      description: 'CAPAs verified closed vs. total',
    },
    {
      label:       'Investigation Timeliness',
      actual:      invTimeliness,
      target:      90,
      unit:        '%',
      onTrack:     invTimeliness >= 90,
      description: 'Investigations approved on time',
    },
  ];
}

// ── Severity distribution (filter-aware) ─────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  'Lost Time':         '#dc2626',
  'Medical Treatment': '#ea580c',
  'First Aid':         '#f59e0b',
  'Near Miss':         '#c8a45a',
};

export function computeSeverityData(filters: DashboardFilters): SeverityRecord[] {
  const filtered = INCIDENT_SEED.filter((inc) => {
    if (filters.division     && inc.division     !== filters.division)     return false;
    if (filters.incidentType && inc.incidentType !== filters.incidentType) return false;
    if (filters.dateFrom && inc.dateTime < filters.dateFrom) return false;
    if (filters.dateTo   && inc.dateTime > filters.dateTo)   return false;
    return true;
  });

  const counts: Record<string, number> = {};
  for (const inc of filtered) {
    const sev = inc.severity || 'Near Miss';
    counts[sev] = (counts[sev] || 0) + 1;
  }

  return Object.entries(SEVERITY_COLORS)
    .map(([severity, fill]) => ({
      severity: severity as SeverityRecord['severity'],
      count: counts[severity] || 0,
      fill,
    }))
    .filter((r) => r.count > 0);
}

// ── Recent incidents ──────────────────────────────────────────────────────

export function getRecentIncidents(filters: DashboardFilters) {
  return INCIDENT_SEED
    .filter((inc) => {
      if (filters.division     && inc.division     !== filters.division)     return false;
      if (filters.incidentType && inc.incidentType !== filters.incidentType) return false;
      if (filters.dateFrom && inc.dateTime < filters.dateFrom) return false;
      if (filters.dateTo   && inc.dateTime > filters.dateTo)   return false;
      return true;
    })
    .slice(-10)
    .reverse();
}

// ── Available hours for display ───────────────────────────────────────────

export function getLatestHoursEntry(): HoursWorkedEntry | null {
  if (HOURS_WORKED_SEED.length === 0) return null;
  return HOURS_WORKED_SEED[HOURS_WORKED_SEED.length - 1];
}

// ── Avg hours per month (for TRIR trend chart) ────────────────────────────

export function getAvgMonthlyHours(hoursEntries: HoursWorkedEntry[] = HOURS_WORKED_SEED): number {
  const total = hoursEntries.reduce((s, h) => s + h.companyWide, 0);
  const months = MONTHLY_INCIDENT_SEED.length;
  return months > 0 ? Math.round(total / months) : 100_000;
}

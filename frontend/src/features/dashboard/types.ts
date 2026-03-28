import type { Division } from '../../types';
import type { IncidentType, Severity } from '../incidents/types';

// ── Filter shape ──────────────────────────────────────────────────────────

export interface DashboardFilters {
  dateFrom: string;
  dateTo: string;
  division: Division | '';
  incidentType: IncidentType | '';
}

export const DEFAULT_FILTERS: DashboardFilters = {
  dateFrom: '2025-04-01',
  dateTo:   '2026-03-31',
  division:     '',
  incidentType: '',
};

// ── Hours worked ──────────────────────────────────────────────────────────

export interface HoursWorkedEntry {
  id: string;
  period: string;          // 'YYYY-MM'
  companyWide: number;
  byDivision: Partial<Record<Division, number>>;
  enteredBy: string;
  enteredAt: string;
}

// ── Monthly incident record (seed) ────────────────────────────────────────

export interface MonthlyIncidentRecord {
  month: string;           // 'YYYY-MM'
  label: string;           // 'Jan 25'
  Injury: number;
  'Near Miss': number;
  'Property Damage': number;
  Environmental: number;
  Vehicle: number;
  Fire: number;
  'Utility Strike': number;
  // computed
  totalRecordable: number; // Injury + Property Damage + Environmental + Vehicle + Fire + Utility Strike (excl Near Miss)
  dartCases: number;       // subset of recordable — lost time + restricted duty cases
  lostWorkDays: number;
}

// ── Division incident record (seed) ───────────────────────────────────────

export interface DivisionIncidentRecord {
  division: Division;
  Injury: number;
  'Near Miss': number;
  'Property Damage': number;
  Environmental: number;
  Vehicle: number;
  Fire: number;
  'Utility Strike': number;
}

// ── Severity record (seed) ────────────────────────────────────────────────

export interface SeverityRecord {
  severity: Severity;
  count: number;
  fill: string;
}

// ── Seed: Hours worked ────────────────────────────────────────────────────

export const HOURS_WORKED_SEED: HoursWorkedEntry[] = [
  {
    id: 'hw-2025',
    period: '2025',
    companyWide: 1_180_000,
    byDivision: {
      HCC:          320_000,
      HRSI:         210_000,
      HSI:          180_000,
      HTI:          160_000,
      HTSI:         140_000,
      'Herzog Energy': 100_000,
      'Green Group':    70_000,
    },
    enteredBy: 'T. Griffith',
    enteredAt: '2026-01-15T10:00:00',
  },
  {
    id: 'hw-2026-q1',
    period: '2026-Q1',
    companyWide: 295_000,
    byDivision: {
      HCC:          80_000,
      HRSI:         52_000,
      HSI:          45_000,
      HTI:          40_000,
      HTSI:         35_000,
      'Herzog Energy': 25_000,
      'Green Group':   18_000,
    },
    enteredBy: 'T. Griffith',
    enteredAt: '2026-03-15T10:00:00',
  },
];

// ── Seed: Monthly incident trend (Apr 2025 – Mar 2026) ───────────────────

export const MONTHLY_INCIDENT_SEED: MonthlyIncidentRecord[] = [
  { month: '2025-04', label: 'Apr 25', Injury: 3, 'Near Miss': 5, 'Property Damage': 2, Environmental: 0, Vehicle: 1, Fire: 0, 'Utility Strike': 0, totalRecordable: 6, dartCases: 2, lostWorkDays: 8  },
  { month: '2025-05', label: 'May 25', Injury: 4, 'Near Miss': 7, 'Property Damage': 1, Environmental: 1, Vehicle: 0, Fire: 0, 'Utility Strike': 0, totalRecordable: 6, dartCases: 3, lostWorkDays: 14 },
  { month: '2025-06', label: 'Jun 25', Injury: 2, 'Near Miss': 6, 'Property Damage': 3, Environmental: 0, Vehicle: 2, Fire: 0, 'Utility Strike': 0, totalRecordable: 7, dartCases: 1, lostWorkDays: 4  },
  { month: '2025-07', label: 'Jul 25', Injury: 5, 'Near Miss': 8, 'Property Damage': 2, Environmental: 0, Vehicle: 1, Fire: 0, 'Utility Strike': 1, totalRecordable: 9, dartCases: 4, lostWorkDays: 22 },
  { month: '2025-08', label: 'Aug 25', Injury: 3, 'Near Miss': 9, 'Property Damage': 1, Environmental: 1, Vehicle: 0, Fire: 1, 'Utility Strike': 0, totalRecordable: 6, dartCases: 2, lostWorkDays: 10 },
  { month: '2025-09', label: 'Sep 25', Injury: 2, 'Near Miss': 4, 'Property Damage': 2, Environmental: 0, Vehicle: 1, Fire: 0, 'Utility Strike': 0, totalRecordable: 5, dartCases: 1, lostWorkDays: 5  },
  { month: '2025-10', label: 'Oct 25', Injury: 4, 'Near Miss': 6, 'Property Damage': 3, Environmental: 0, Vehicle: 2, Fire: 0, 'Utility Strike': 0, totalRecordable: 9, dartCases: 3, lostWorkDays: 18 },
  { month: '2025-11', label: 'Nov 25', Injury: 3, 'Near Miss': 5, 'Property Damage': 1, Environmental: 1, Vehicle: 1, Fire: 0, 'Utility Strike': 0, totalRecordable: 6, dartCases: 2, lostWorkDays: 9  },
  { month: '2025-12', label: 'Dec 25', Injury: 2, 'Near Miss': 3, 'Property Damage': 1, Environmental: 0, Vehicle: 0, Fire: 0, 'Utility Strike': 0, totalRecordable: 3, dartCases: 1, lostWorkDays: 5  },
  { month: '2026-01', label: 'Jan 26', Injury: 3, 'Near Miss': 5, 'Property Damage': 2, Environmental: 0, Vehicle: 1, Fire: 0, 'Utility Strike': 0, totalRecordable: 6, dartCases: 2, lostWorkDays: 11 },
  { month: '2026-02', label: 'Feb 26', Injury: 2, 'Near Miss': 4, 'Property Damage': 1, Environmental: 0, Vehicle: 1, Fire: 0, 'Utility Strike': 0, totalRecordable: 4, dartCases: 1, lostWorkDays: 6  },
  { month: '2026-03', label: 'Mar 26', Injury: 4, 'Near Miss': 6, 'Property Damage': 2, Environmental: 0, Vehicle: 1, Fire: 0, 'Utility Strike': 0, totalRecordable: 7, dartCases: 2, lostWorkDays: 14 },
];

// ── Seed: Division incident breakdown ─────────────────────────────────────

export const DIVISION_INCIDENT_SEED: DivisionIncidentRecord[] = [
  { division: 'HCC',           Injury: 12, 'Near Miss': 18, 'Property Damage': 5, Environmental: 1, Vehicle: 3, Fire: 1, 'Utility Strike': 1 },
  { division: 'HRSI',          Injury: 7,  'Near Miss': 14, 'Property Damage': 4, Environmental: 0, Vehicle: 2, Fire: 0, 'Utility Strike': 0 },
  { division: 'HSI',           Injury: 5,  'Near Miss': 8,  'Property Damage': 3, Environmental: 1, Vehicle: 2, Fire: 0, 'Utility Strike': 0 },
  { division: 'HTI',           Injury: 4,  'Near Miss': 6,  'Property Damage': 2, Environmental: 0, Vehicle: 1, Fire: 0, 'Utility Strike': 0 },
  { division: 'HTSI',          Injury: 3,  'Near Miss': 5,  'Property Damage': 2, Environmental: 0, Vehicle: 1, Fire: 0, 'Utility Strike': 0 },
  { division: 'Herzog Energy', Injury: 2,  'Near Miss': 4,  'Property Damage': 2, Environmental: 1, Vehicle: 0, Fire: 0, 'Utility Strike': 0 },
  { division: 'Green Group',   Injury: 1,  'Near Miss': 3,  'Property Damage': 1, Environmental: 0, Vehicle: 0, Fire: 0, 'Utility Strike': 0 },
];

// ── Seed: Severity distribution ───────────────────────────────────────────

export const SEVERITY_SEED: SeverityRecord[] = [
  { severity: 'Lost Time',         count: 8,  fill: '#dc2626' },
  { severity: 'Medical Treatment', count: 26, fill: '#ea580c' },
  { severity: 'First Aid',         count: 15, fill: '#f59e0b' },
  { severity: 'Near Miss',         count: 68, fill: '#c8a45a' },
];

// ── TRIR benchmark ────────────────────────────────────────────────────────

export const TRIR_BENCHMARK = 2.5; // industry average for rail construction

// ── Shared chart constants ───────────────────────────────────────────────

export const INCIDENT_TYPE_COLORS: Record<string, string> = {
  Injury:           '#dc2626',
  'Near Miss':      '#c8a45a',
  'Property Damage':'#3b82f6',
  Environmental:    '#22c55e',
  Vehicle:          '#a855f7',
  Fire:             '#f97316',
  'Utility Strike': '#06b6d4',
};

export const INCIDENT_TYPES = ['Injury', 'Near Miss', 'Property Damage', 'Environmental', 'Vehicle', 'Fire', 'Utility Strike'] as const;

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  background: 'var(--color-surface, #1a1a1a)',
  border: '1px solid var(--color-border, #2a2a2a)',
  borderRadius: '6px',
  fontSize: '0.8125rem',
};

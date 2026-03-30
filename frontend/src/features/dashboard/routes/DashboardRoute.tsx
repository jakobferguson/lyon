import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { Spinner } from '../../../components/ui';
import type { DashboardFilters, MonthlyIncidentRecord, DivisionIncidentRecord, SeverityRecord } from '../types';
import { DEFAULT_FILTERS, TRIR_BENCHMARK } from '../types';
import type { KpiData, TrirDataPoint, LeadingIndicator } from '../utils';
import { useDashboard } from '../api/dashboard';
import type { DashboardResponse, MonthlyTrendPoint, DivisionBreakdownItem } from '../api/dashboard';
import type { Incident } from '../../incidents/types';

import { DashboardFiltersBar } from '../components/DashboardFilters/DashboardFilters';
import { KpiCards } from '../components/KpiCards/KpiCards';
import { IncidentTrendChart } from '../components/IncidentTrendChart/IncidentTrendChart';
import { TrirTrendChart } from '../components/TrirTrendChart/TrirTrendChart';
import { DivisionChart } from '../components/DivisionChart/DivisionChart';
import { SeverityDonut } from '../components/SeverityDonut/SeverityDonut';
import { LeadingIndicators } from '../components/LeadingIndicators/LeadingIndicators';
import { RecentIncidentsTable } from '../components/RecentIncidentsTable/RecentIncidentsTable';
import { HoursWorkedForm } from '../components/HoursWorkedForm/HoursWorkedForm';
import { Button } from '../../../components/ui';

import styles from './DashboardRoute.module.css';

// ── Map API response to component interfaces ────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  'Lost Time':         '#dc2626',
  'Medical Treatment': '#ea580c',
  'First Aid':         '#f59e0b',
  'Near Miss':         '#c8a45a',
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function mapKpis(resp: DashboardResponse): KpiData {
  const kpis = resp.kpis;
  return {
    trir:             kpis.trir,
    trirPrev:         kpis.trir - kpis.trirTrend, // trend is delta
    dartRate:         kpis.dartRate,
    dartRatePrev:     kpis.dartRate - kpis.dartRateTrend,
    nearMissRatio:    kpis.nearMissRatio > 0 ? Math.round(kpis.nearMissRatio * 10) / 10 : null,
    openInvestigations: kpis.openInvestigations,
    openCapas:        kpis.openCapas,
    lostWorkDaysYtd:  kpis.lostWorkDaysYtd,
    hoursAvailable:   kpis.trir > 0 || kpis.dartRate > 0,
  };
}

function mapIncidentTrend(points: MonthlyTrendPoint[]): MonthlyIncidentRecord[] {
  // Group by month, pivot categories into columns
  const byMonth = new Map<string, MonthlyIncidentRecord>();

  for (const pt of points) {
    const key = `${pt.year}-${String(pt.month).padStart(2, '0')}`;
    if (!byMonth.has(key)) {
      const label = `${MONTH_LABELS[pt.month - 1]} ${String(pt.year).slice(2)}`;
      byMonth.set(key, {
        month: key, label,
        Injury: 0, 'Near Miss': 0, 'Property Damage': 0,
        Environmental: 0, Vehicle: 0, Fire: 0, 'Utility Strike': 0,
        totalRecordable: 0, dartCases: 0, lostWorkDays: 0,
      });
    }
    const rec = byMonth.get(key)!;
    const cat = pt.category ?? '';
    if (cat in rec) {
      (rec as unknown as Record<string, number>)[cat] = pt.value;
    }
  }

  return Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
}

function mapTrirTrend(points: MonthlyTrendPoint[]): TrirDataPoint[] {
  return points.map((pt) => ({
    label: `${MONTH_LABELS[pt.month - 1]} ${String(pt.year).slice(2)}`,
    trir: Number(pt.value.toFixed(2)),
    benchmark: TRIR_BENCHMARK,
  }));
}

function mapDivisionBreakdown(items: DivisionBreakdownItem[]): DivisionIncidentRecord[] {
  const byDiv = new Map<string, DivisionIncidentRecord>();

  for (const item of items) {
    if (!byDiv.has(item.division)) {
      byDiv.set(item.division, {
        division: item.division as DivisionIncidentRecord['division'],
        Injury: 0, 'Near Miss': 0, 'Property Damage': 0,
        Environmental: 0, Vehicle: 0, Fire: 0, 'Utility Strike': 0,
      });
    }
    const rec = byDiv.get(item.division)!;
    if (item.incidentType in rec) {
      (rec as unknown as Record<string, number | string>)[item.incidentType] = item.count;
    }
  }

  return Array.from(byDiv.values());
}

function mapSeverity(items: { severity: string; count: number }[]): SeverityRecord[] {
  return items
    .map((s) => ({
      severity: s.severity as SeverityRecord['severity'],
      count: s.count,
      fill: SEVERITY_COLORS[s.severity] ?? '#888',
    }))
    .filter((r) => r.count > 0);
}

function mapLeadingIndicators(resp: DashboardResponse): LeadingIndicator[] {
  const li = resp.leadingIndicators;
  return [
    {
      label:       'Near Miss Reporting Rate',
      actual:      Number(li.nearMissReportingRate.toFixed(1)),
      target:      Number(li.nearMissTarget),
      unit:        'ratio',
      onTrack:     li.nearMissReportingRate >= li.nearMissTarget,
      description: 'Near miss reports per recordable incident',
    },
    {
      label:       'CAPA Closure Rate',
      actual:      Math.round(li.capaClosureRate * 100),
      target:      Math.round(li.capaClosureTarget * 100),
      unit:        '%',
      onTrack:     li.capaClosureRate >= li.capaClosureTarget,
      description: 'CAPAs verified closed vs. total',
    },
    {
      label:       'Investigation Timeliness',
      actual:      Math.round(li.investigationTimeliness * 100),
      target:      Math.round(li.investigationTimelinessTarget * 100),
      unit:        '%',
      onTrack:     li.investigationTimeliness >= li.investigationTimelinessTarget,
      description: 'Investigations approved on time',
    },
  ];
}

function mapRecentIncidents(items: DashboardResponse['recentIncidents']): Incident[] {
  return items.map((inc) => ({
    id: inc.id,
    incidentNumber: inc.incidentNumber,
    incidentType: inc.incidentType as Incident['incidentType'],
    dateTime: inc.dateTime,
    division: (inc.division || '') as Incident['division'],
    project: inc.project || '',
    severity: (inc.severity || '') as Incident['severity'],
    status: inc.status as Incident['status'],
    description: inc.description,
    location: {
      ...inc.location,
      gpsSource: (inc.location.gpsSource ?? 'manual') as 'manual' | 'gps',
    },
    reportedBy: inc.reportedBy,
  }));
}

// ── Component ───────────────────────────────────────────────────────────────

export function DashboardRoute() {
  const { role } = useAuthStore();
  const [filters, setFilters]               = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [hoursModalOpen, setHoursModalOpen] = useState(false);

  const isSafetyManager = role === 'safety_manager' || role === 'admin';

  const apiParams = useMemo(() => ({
    startDate: filters.dateFrom || undefined,
    endDate: filters.dateTo || undefined,
    incidentType: filters.incidentType || undefined,
  }), [filters]);

  const { data: dashboardData, isLoading } = useDashboard(apiParams);

  const kpiData = useMemo(
    () => dashboardData ? mapKpis(dashboardData) : {
      trir: null, trirPrev: null, dartRate: null, dartRatePrev: null,
      nearMissRatio: null, openInvestigations: 0, openCapas: 0,
      lostWorkDaysYtd: 0, hoursAvailable: false,
    } as KpiData,
    [dashboardData],
  );

  const incidentTrend = useMemo(
    () => dashboardData ? mapIncidentTrend(dashboardData.incidentTrend) : [],
    [dashboardData],
  );

  const trirTrendData = useMemo(
    () => dashboardData ? mapTrirTrend(dashboardData.trirTrend) : [],
    [dashboardData],
  );

  const divisionData = useMemo(
    () => dashboardData ? mapDivisionBreakdown(dashboardData.divisionBreakdown) : [],
    [dashboardData],
  );

  const severityData = useMemo(
    () => dashboardData ? mapSeverity(dashboardData.severityDistribution) : [],
    [dashboardData],
  );

  const leadingData = useMemo(
    () => dashboardData ? mapLeadingIndicators(dashboardData) : [],
    [dashboardData],
  );

  const recentIncidents = useMemo(
    () => dashboardData ? mapRecentIncidents(dashboardData.recentIncidents) : [],
    [dashboardData],
  );

  function handleHoursSave(_entry: import('../types').HoursWorkedEntry) {
    // TODO: wire to backend admin/hours-worked endpoint when available
    setHoursModalOpen(false);
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Safety Dashboard</h1>
          <p className={styles.subtitle}>Company-wide safety performance metrics</p>
        </div>
        {isSafetyManager && (
          <Button variant="secondary" onClick={() => setHoursModalOpen(true)}>
            Enter Hours Worked
          </Button>
        )}
      </div>

      {/* Filters */}
      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      {isLoading && (
        <div className={styles.loading}><Spinner size="lg" /></div>
      )}

      {!isLoading && (
        <>
          {/* KPI Cards */}
          <KpiCards data={kpiData} />

          {/* Primary charts row */}
          <div className={styles.chartsRow}>
            <div className={styles.chartWide}>
              <IncidentTrendChart data={incidentTrend} />
            </div>
            <div className={styles.chartNarrow}>
              <SeverityDonut data={severityData} />
            </div>
          </div>

          {/* Secondary charts row */}
          <div className={styles.chartsRow}>
            <div className={styles.chartWide}>
              <DivisionChart data={divisionData} />
            </div>
            <div className={styles.chartNarrow}>
              <TrirTrendChart data={trirTrendData} />
            </div>
          </div>

          {/* Leading indicators */}
          <LeadingIndicators indicators={leadingData} />

          {/* Recent incidents table */}
          <RecentIncidentsTable incidents={recentIncidents} />
        </>
      )}

      {/* Hours worked modal */}
      <HoursWorkedForm
        open={hoursModalOpen}
        onClose={() => setHoursModalOpen(false)}
        onSave={handleHoursSave}
      />
    </div>
  );
}

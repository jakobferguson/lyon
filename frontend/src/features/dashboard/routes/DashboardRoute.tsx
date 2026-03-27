import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import type { DashboardFilters, HoursWorkedEntry } from '../types';
import { DEFAULT_FILTERS, MONTHLY_INCIDENT_SEED, DIVISION_INCIDENT_SEED, SEVERITY_SEED, TRIR_BENCHMARK, HOURS_WORKED_SEED } from '../types';
import {
  filterMonthly,
  computeKpiData,
  computeLeadingIndicators,
  getRecentIncidents,
  buildTrirTrendData,
  getAvgMonthlyHours,
} from '../utils';

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

export function DashboardRoute() {
  const { role } = useAuthStore();
  const [filters, setFilters]               = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [hoursModalOpen, setHoursModalOpen] = useState(false);
  const [, setHoursEntries]     = useState<HoursWorkedEntry[]>(HOURS_WORKED_SEED);

  const isSafetyManager = role === 'safety_manager' || role === 'admin';

  const filteredMonthly = useMemo(() => filterMonthly(MONTHLY_INCIDENT_SEED, filters), [filters]);
  const kpiData         = useMemo(() => computeKpiData(filters), [filters]);
  const leadingData     = useMemo(() => computeLeadingIndicators(), []);
  const recentIncidents = useMemo(() => getRecentIncidents(filters), [filters]);

  const avgMonthlyHours = useMemo(() => getAvgMonthlyHours(), []);
  const trirTrendData   = useMemo(
    () => buildTrirTrendData(filteredMonthly, avgMonthlyHours, TRIR_BENCHMARK),
    [filteredMonthly, avgMonthlyHours],
  );

  function handleHoursSave(entry: HoursWorkedEntry) {
    setHoursEntries((prev) => [...prev, entry]);
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

      {/* KPI Cards */}
      <KpiCards data={kpiData} />

      {/* Primary charts row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartWide}>
          <IncidentTrendChart data={filteredMonthly} />
        </div>
        <div className={styles.chartNarrow}>
          <SeverityDonut data={SEVERITY_SEED} />
        </div>
      </div>

      {/* Secondary charts row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartWide}>
          <DivisionChart data={DIVISION_INCIDENT_SEED} />
        </div>
        <div className={styles.chartNarrow}>
          <TrirTrendChart data={trirTrendData} />
        </div>
      </div>

      {/* Leading indicators */}
      <LeadingIndicators indicators={leadingData} />

      {/* Recent incidents table */}
      <RecentIncidentsTable incidents={recentIncidents} />

      {/* Hours worked modal */}
      <HoursWorkedForm
        open={hoursModalOpen}
        onClose={() => setHoursModalOpen(false)}
        onSave={handleHoursSave}
      />
    </div>
  );
}

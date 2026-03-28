import type { DashboardFilters } from '../../types';
import { DEFAULT_FILTERS } from '../../types';
import type { Division } from '../../../../types';
import type { IncidentType } from '../../../incidents/types';
import styles from './DashboardFilters.module.css';

const DIVISIONS: Division[] = ['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'Herzog Energy', 'Green Group'];
const INCIDENT_TYPES: IncidentType[] = [
  'Injury', 'Near Miss', 'Property Damage', 'Environmental', 'Vehicle', 'Fire', 'Utility Strike',
];

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}

export function DashboardFiltersBar({ filters, onChange }: DashboardFiltersProps) {
  function set<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters =
    filters.dateFrom    !== DEFAULT_FILTERS.dateFrom ||
    filters.dateTo      !== DEFAULT_FILTERS.dateTo   ||
    filters.division    !== ''                        ||
    filters.incidentType !== '';

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <label className={styles.filterLabel} htmlFor="dash-date-from">From</label>
        <input
          id="dash-date-from"
          type="date"
          className="lyon-input"
          value={filters.dateFrom}
          onChange={(e) => set('dateFrom', e.target.value)}
        />
      </div>
      <div className={styles.group}>
        <label className={styles.filterLabel} htmlFor="dash-date-to">To</label>
        <input
          id="dash-date-to"
          type="date"
          className="lyon-input"
          value={filters.dateTo}
          onChange={(e) => set('dateTo', e.target.value)}
        />
      </div>
      <div className={styles.group}>
        <label className={styles.filterLabel} htmlFor="dash-division">Division</label>
        <select
          id="dash-division"
          className="lyon-input"
          value={filters.division}
          onChange={(e) => set('division', e.target.value as Division | '')}
        >
          <option value="">All Divisions</option>
          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className={styles.group}>
        <label className={styles.filterLabel} htmlFor="dash-type">Incident Type</label>
        <select
          id="dash-type"
          className="lyon-input"
          value={filters.incidentType}
          onChange={(e) => set('incidentType', e.target.value as IncidentType | '')}
        >
          <option value="">All Types</option>
          {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {hasActiveFilters && (
        <button
          className={styles.clearBtn}
          onClick={() => onChange({ ...DEFAULT_FILTERS })}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

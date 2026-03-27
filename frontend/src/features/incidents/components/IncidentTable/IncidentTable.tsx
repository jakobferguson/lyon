import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, type BadgeVariant } from '../../../../components/ui';
import type { IncidentStatus, IncidentType } from '../../types';
import { INCIDENT_SEED } from '../../types';
import styles from './IncidentTable.module.css';

const STATUS_VARIANT: Record<IncidentStatus, BadgeVariant> = {
  'Draft':                   'neutral',
  'Reported':                'info',
  'Under Investigation':     'pending',
  'Investigation Complete':  'pending',
  'Investigation Approved':  'active',
  'CAPA Assigned':           'pending',
  'CAPA In Progress':        'pending',
  'Closed':                  'active',
  'Reopened':                'overdue',
};

const INCIDENT_TYPES: IncidentType[] = [
  'Injury', 'Near Miss', 'Property Damage', 'Environmental', 'Vehicle', 'Fire', 'Utility Strike',
];

const STATUSES: IncidentStatus[] = [
  'Draft', 'Reported', 'Under Investigation', 'Investigation Complete',
  'Investigation Approved', 'CAPA Assigned', 'CAPA In Progress', 'Closed', 'Reopened',
];

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function IncidentTable() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');

  const filtered = useMemo(() => {
    return INCIDENT_SEED.filter((inc) => {
      if (typeFilter   && inc.incidentType !== typeFilter)   return false;
      if (statusFilter && inc.status       !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          inc.incidentNumber.toLowerCase().includes(q) ||
          inc.description.toLowerCase().includes(q)   ||
          inc.project.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [typeFilter, statusFilter, search]);

  return (
    <div className={styles.wrapper}>
      {/* Filters */}
      <div className={styles.filters}>
        <input
          className="lyon-input"
          type="search"
          placeholder="Search incidents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search incidents"
          style={{ maxWidth: '260px' }}
        />
        <select
          className="lyon-input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by incident type"
          style={{ maxWidth: '180px' }}
        >
          <option value="">All Types</option>
          {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="lyon-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          style={{ maxWidth: '200px' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper} role="region" aria-label="Incident list">
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Number</th>
              <th scope="col">Type</th>
              <th scope="col">Date / Time</th>
              <th scope="col">Division</th>
              <th scope="col">Project</th>
              <th scope="col">Severity</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>No incidents match your filters.</td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <tr
                  key={inc.id}
                  className={styles.row}
                  onClick={() => navigate(`/app/incidents/${inc.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/incidents/${inc.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${inc.incidentNumber}`}
                >
                  <td className={styles.number}>{inc.incidentNumber}</td>
                  <td>{inc.incidentType}</td>
                  <td className={styles.date}>{formatDateTime(inc.dateTime)}</td>
                  <td>{inc.division || '—'}</td>
                  <td className={styles.project}>{inc.project}</td>
                  <td>{inc.severity || '—'}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[inc.status]}>{inc.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className={styles.count}>{filtered.length} of {INCIDENT_SEED.length} incidents</p>
    </div>
  );
}

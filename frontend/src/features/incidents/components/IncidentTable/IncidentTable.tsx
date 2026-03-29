import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Spinner } from '../../../../components/ui';
import { useIncidentList } from '../../api/incidents';
import type { IncidentStatus, IncidentType } from '../../types';
import { STATUS_VARIANT, formatDateShort } from '../../utils';
import styles from './IncidentTable.module.css';

const INCIDENT_TYPES: IncidentType[] = [
  'Injury', 'Near Miss', 'Property Damage', 'Environmental', 'Vehicle', 'Fire', 'Utility Strike',
];

const STATUSES: IncidentStatus[] = [
  'Draft', 'Reported', 'Under Investigation', 'Investigation Complete',
  'Investigation Approved', 'CAPA Assigned', 'CAPA In Progress', 'Closed', 'Reopened',
];

export function IncidentTable() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);

  const { data, isLoading, isError } = useIncidentList({
    pageNumber: page,
    pageSize: 20,
    status: statusFilter || undefined,
    incidentType: typeFilter || undefined,
    search: search || undefined,
  });

  const incidents = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={styles.wrapper}>
      {/* Filters */}
      <div className={styles.filters}>
        <input
          className="lyon-input"
          type="search"
          placeholder="Search incidents…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search incidents"
          style={{ maxWidth: '260px' }}
        />
        <select
          className="lyon-input"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          aria-label="Filter by incident type"
          style={{ maxWidth: '180px' }}
        >
          <option value="">All Types</option>
          {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="lyon-input"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          aria-label="Filter by status"
          style={{ maxWidth: '200px' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}><Spinner size="lg" /></div>
      )}

      {isError && (
        <p className={styles.empty}>Failed to load incidents. Please try again.</p>
      )}

      {!isLoading && !isError && (
        <>
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
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.empty}>No incidents match your filters.</td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
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
                      <td className={styles.date}>{formatDateShort(inc.dateTime)}</td>
                      <td>{inc.division || '—'}</td>
                      <td className={styles.project}>{inc.project || '—'}</td>
                      <td>{inc.severity || '—'}</td>
                      <td>
                        <Badge variant={STATUS_VARIANT[inc.status as keyof typeof STATUS_VARIANT] ?? 'neutral'}>{inc.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <p className={styles.count}>{incidents.length} of {totalCount} incidents</p>
            {totalPages > 1 && (
              <div className={styles.pageButtons}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className={styles.pageBtn}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={styles.pageBtn}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

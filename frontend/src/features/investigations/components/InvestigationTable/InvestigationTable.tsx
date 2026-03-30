import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Spinner } from '../../../../components/ui';
import type { InvestigationStatus } from '../../types';
import { useInvestigationList } from '../../api/investigations';
import { INVESTIGATION_STATUS_VARIANT, getEscalationTier, formatDateOnly } from '../../utils';
import styles from './InvestigationTable.module.css';

const STATUSES: InvestigationStatus[] = ['Assigned', 'In Progress', 'Complete', 'Approved', 'Returned'];

const ESCALATION_LABELS: Record<string, string> = {
  none:  '',
  tier1: '⏰ Overdue',
  tier2: '⚠ Overdue +7d',
  tier3: '🚨 Overdue +14d',
};

const TIER_CLASS: Record<string, string | undefined> = {
  tier1: styles.tier1,
  tier2: styles.tier2,
  tier3: styles.tier3,
};

export function InvestigationTable() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useInvestigationList({
    pageNumber: page,
    pageSize: 20,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const investigations = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={styles.wrapper}>
      {/* Filters */}
      <div className={styles.filters}>
        <input
          className="lyon-input"
          type="search"
          placeholder="Search investigations…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search investigations"
          style={{ maxWidth: '260px' }}
        />
        <select
          className="lyon-input"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          aria-label="Filter by status"
          style={{ maxWidth: '180px' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}><Spinner size="lg" /></div>
      )}

      {isError && (
        <p className={styles.empty}>Failed to load investigations. Please try again.</p>
      )}

      {!isLoading && !isError && (
        <>
          {/* Table */}
          <div className={styles.tableWrapper} role="region" aria-label="Investigation list">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Incident</th>
                  <th scope="col">Severity</th>
                  <th scope="col">Division</th>
                  <th scope="col">Lead Investigator</th>
                  <th scope="col">Target Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Escalation</th>
                </tr>
              </thead>
              <tbody>
                {investigations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.empty}>No investigations match your filters.</td>
                  </tr>
                ) : (
                  investigations.map((inv) => {
                    const tier = getEscalationTier(inv.targetCompletionDate, inv.status as InvestigationStatus);

                    return (
                      <tr
                        key={inv.id}
                        className={`${styles.row} ${tier !== 'none' ? styles.overdueRow : ''}`}
                        onClick={() => navigate(`/app/investigations/${inv.id}`)}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/investigations/${inv.id}`)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View investigation for ${inv.incidentNumber}`}
                      >
                        <td className={styles.incidentNum}>{inv.incidentNumber}</td>
                        <td>{inv.severity}</td>
                        <td>{inv.division || '—'}</td>
                        <td>{inv.leadInvestigator ?? <span className={styles.unassigned}>Unassigned</span>}</td>
                        <td className={styles.date}>
                          {formatDateOnly(inv.targetCompletionDate)}
                        </td>
                        <td>
                          <Badge variant={INVESTIGATION_STATUS_VARIANT[inv.status as keyof typeof INVESTIGATION_STATUS_VARIANT] ?? 'neutral'}>{inv.status}</Badge>
                        </td>
                        <td>
                          {tier !== 'none' && (
                            <span className={`${styles.escalationPill} ${TIER_CLASS[tier] ?? ''}`}>
                              {ESCALATION_LABELS[tier]}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <p className={styles.count}>{investigations.length} of {totalCount} investigations</p>
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

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../../components/ui';
import type { InvestigationStatus } from '../../types';
import { INVESTIGATION_SEED } from '../../types';
import { INVESTIGATION_STATUS_VARIANT, getEscalationTier, formatDateOnly } from '../../utils';
import styles from './InvestigationTable.module.css';

const STATUSES: InvestigationStatus[] = ['Assigned', 'In Progress', 'Complete', 'Approved', 'Returned'];

const ESCALATION_LABELS: Record<string, string> = {
  none:  '',
  tier1: '⏰ Overdue',
  tier2: '⚠ Overdue +7d',
  tier3: '🚨 Overdue +14d',
};

export function InvestigationTable() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return INVESTIGATION_SEED.filter((inv) => {
      if (statusFilter && inv.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          inv.incidentNumber.toLowerCase().includes(q) ||
          inv.division.toLowerCase().includes(q) ||
          inv.project.toLowerCase().includes(q) ||
          (inv.assignment?.leadInvestigator.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [statusFilter, search]);

  return (
    <div className={styles.wrapper}>
      {/* Filters */}
      <div className={styles.filters}>
        <input
          className="lyon-input"
          type="search"
          placeholder="Search investigations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search investigations"
          style={{ maxWidth: '260px' }}
        />
        <select
          className="lyon-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          style={{ maxWidth: '180px' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>No investigations match your filters.</td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const tier = inv.assignment
                  ? getEscalationTier(inv.assignment.targetDate, inv.status)
                  : 'none';

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
                    <td>{inv.assignment?.leadInvestigator ?? <span className={styles.unassigned}>Unassigned</span>}</td>
                    <td className={styles.date}>
                      {inv.assignment ? formatDateOnly(inv.assignment.targetDate) : '—'}
                    </td>
                    <td>
                      <Badge variant={INVESTIGATION_STATUS_VARIANT[inv.status]}>{inv.status}</Badge>
                    </td>
                    <td>
                      {tier !== 'none' && (
                        <span className={`${styles.escalationPill} ${styles[tier]}`}>
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

      <p className={styles.count}>{filtered.length} of {INVESTIGATION_SEED.length} investigations</p>
    </div>
  );
}

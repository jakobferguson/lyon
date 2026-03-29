import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Spinner } from '../../../../components/ui';
import type { CapaCategory, CapaPriority, CapaStatus } from '../../types';
import { useCapaList } from '../../api/capas';
import { CAPA_STATUS_VARIANT, PRIORITY_VARIANT, formatDateOnly } from '../../utils';
import styles from './CapaTable.module.css';

const STATUSES: CapaStatus[] = [
  'Open', 'In Progress', 'Completed', 'Verification Pending', 'Verified Effective', 'Verified Ineffective',
];
const PRIORITIES: CapaPriority[] = ['Critical', 'High', 'Medium', 'Low'];
const CATEGORIES: CapaCategory[] = [
  'Training', 'Procedure Change', 'Engineering Control', 'PPE', 'Equipment Modification', 'Policy Change', 'Other',
];

export function CapaTable() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter]     = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [_categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useCapaList({
    pageNumber: page,
    pageSize: 20,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const capas = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <select className="lyon-input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: '200px' }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="lyon-input" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} style={{ maxWidth: '140px' }}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="lyon-input" value={_categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} style={{ maxWidth: '200px' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className={styles.loadingWrap}><Spinner size="lg" /></div>
      )}

      {isError && (
        <p className={styles.empty}>Failed to load CAPAs. Please try again.</p>
      )}

      {!isLoading && !isError && (
        <>
          <div className={styles.tableWrapper} role="region" aria-label="CAPA list">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">CAPA #</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Type</th>
                  <th scope="col">Category</th>
                  <th scope="col">Assigned To</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {capas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.empty}>No CAPAs match your filters.</td>
                  </tr>
                ) : (
                  capas.map((capa) => {
                    const overdue = new Date(capa.dueDate) < new Date() && !['Verified Effective', 'Verified Ineffective'].includes(capa.status);
                    return (
                      <tr
                        key={capa.id}
                        className={`${styles.row} ${overdue ? styles.overdueRow : ''}`}
                        onClick={() => navigate(`/app/capas/${capa.id}`)}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/capas/${capa.id}`)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View ${capa.capaNumber}`}
                      >
                        <td className={styles.capaNum}>{capa.capaNumber}</td>
                        <td>
                          <Badge variant={PRIORITY_VARIANT[capa.priority as keyof typeof PRIORITY_VARIANT] ?? 'neutral'}>{capa.priority}</Badge>
                        </td>
                        <td>{capa.type}</td>
                        <td>{capa.category}</td>
                        <td>{capa.assignedTo}</td>
                        <td className={overdue ? styles.overdueDate : ''}>
                          {formatDateOnly(capa.dueDate)}
                          {overdue && <span className={styles.overdueTag}> Overdue</span>}
                        </td>
                        <td>
                          <Badge variant={CAPA_STATUS_VARIANT[capa.status as keyof typeof CAPA_STATUS_VARIANT] ?? 'neutral'}>{capa.status}</Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <p className={styles.count}>{capas.length} of {totalCount} CAPAs</p>
            {totalPages > 1 && (
              <div className={styles.pageButtons}>
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={styles.pageBtn}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={styles.pageBtn}>Next</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

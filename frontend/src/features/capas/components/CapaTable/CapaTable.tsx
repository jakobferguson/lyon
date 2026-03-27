import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../../components/ui';
import type { CapaCategory, CapaPriority, CapaStatus } from '../../types';
import { CAPA_SEED } from '../../types';
import { CAPA_STATUS_VARIANT, PRIORITY_VARIANT, formatDateOnly, isOverdue } from '../../utils';
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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch]                 = useState('');

  const filtered = useMemo(() => {
    return CAPA_SEED.filter((c) => {
      if (statusFilter   && c.status   !== statusFilter)   return false;
      if (priorityFilter && c.priority !== priorityFilter) return false;
      if (categoryFilter && c.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.capaNumber.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.assignedTo.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [statusFilter, priorityFilter, categoryFilter, search]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <input
          className="lyon-input"
          type="search"
          placeholder="Search CAPAs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search CAPAs"
          style={{ maxWidth: '240px' }}
        />
        <select className="lyon-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="lyon-input" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ maxWidth: '140px' }}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="lyon-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ maxWidth: '200px' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>No CAPAs match your filters.</td>
              </tr>
            ) : (
              filtered.map((capa) => {
                const overdue = isOverdue(capa);
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
                      <Badge variant={PRIORITY_VARIANT[capa.priority]}>{capa.priority}</Badge>
                    </td>
                    <td>{capa.type}</td>
                    <td>{capa.category}</td>
                    <td>{capa.assignedTo}</td>
                    <td className={overdue ? styles.overdueDate : ''}>
                      {formatDateOnly(capa.dueDate)}
                      {overdue && <span className={styles.overdueTag}> Overdue</span>}
                    </td>
                    <td>
                      <Badge variant={CAPA_STATUS_VARIANT[capa.status]}>{capa.status}</Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className={styles.count}>{filtered.length} of {CAPA_SEED.length} CAPAs</p>
    </div>
  );
}

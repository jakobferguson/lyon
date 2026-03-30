import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { Spinner } from '../../../components/ui';
import { useAuditLog } from '../api/admin';
import styles from './AdminAuditLogRoute.module.css';

const ACTION_LABELS: Record<string, string> = {
  create:   'Create',
  update:   'Update',
  delete:   'Delete',
  approve:  'Approve',
  return:   'Return',
  verify:   'Verify',
  generate: 'Generate',
};

const ACTION_KEYS = Object.keys(ACTION_LABELS);

export function AdminAuditLogRoute() {
  const role = useAuthStore((s) => s.role);
  const [page, setPage] = useState(1);
  const [filterEntity, setFilterEntity] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate]     = useState('');

  const isAdmin = role === 'admin';

  const { data, isLoading } = useAuditLog({
    pageNumber: page,
    pageSize: 50,
    entityType: filterEntity || undefined,
    action: filterAction || undefined,
    startDate: filterDate || undefined,
  });

  const entries = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  if (!isAdmin) {
    return (
      <div className={styles.gated}>
        <span className={styles.gatedIcon}>🔒</span>
        <h2 className={styles.gatedTitle}>Admin Access Required</h2>
        <p className={styles.gatedBody}>The Audit Log is only accessible to users with the Admin role.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Audit Log</h1>
          <p className={styles.subtitle}>Immutable record of all system changes and actions. {totalCount} entries.</p>
        </div>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.select}
          value={filterEntity}
          onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
        >
          <option value="">All Entity Types</option>
          <option value="Incident">Incident</option>
          <option value="Investigation">Investigation</option>
          <option value="Capa">CAPA</option>
          <option value="FactorType">Factor Type</option>
          <option value="Railroad">Railroad</option>
        </select>
        <select
          className={styles.select}
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
        >
          <option value="">All Actions</option>
          {ACTION_KEYS.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>
        <input
          type="date"
          className={styles.select}
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
        />
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}><Spinner size="lg" /></div>
      )}

      {!isLoading && (
        <>
          <p className={styles.resultCount}>{entries.length} of {totalCount} result{totalCount !== 1 ? 's' : ''}</p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className={styles.timeCell}>
                      {new Date(entry.timestamp).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td>{entry.userDisplayName}</td>
                    <td>
                      <span className={`${styles.actionBadge} ${styles[`action${entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}`] ?? ''}`}>
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span className={styles.entityType}>{entry.entityType}</span>
                      </div>
                    </td>
                    <td className={styles.detailCell}>
                      {entry.fieldName && (
                        <span>
                          <strong>{entry.fieldName}:</strong>{' '}
                          {entry.oldValue && <><span className={styles.oldVal}>{entry.oldValue}</span> → </>}
                          <span className={styles.newVal}>{entry.newValue}</span>
                        </span>
                      )}
                      {entry.justification && (
                        <em className={styles.justification}> "{entry.justification}"</em>
                      )}
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.empty}>No entries match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={styles.pageBtn}>Previous</button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={styles.pageBtn}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

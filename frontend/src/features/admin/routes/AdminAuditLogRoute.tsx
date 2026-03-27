import { useState, useMemo } from 'react';
import { AUDIT_LOG_SEED, type AuditLogEntry } from '../types';
import { useAuthStore } from '../../../stores/authStore';
import styles from './AdminAuditLogRoute.module.css';

const ACTION_LABELS: Record<AuditLogEntry['action'], string> = {
  create:   'Create',
  update:   'Update',
  delete:   'Delete',
  approve:  'Approve',
  return:   'Return',
  verify:   'Verify',
  generate: 'Generate',
};

const ACTION_COLORS: Record<AuditLogEntry['action'], string> = {
  create:   styles.actionCreate,
  update:   styles.actionUpdate,
  delete:   styles.actionDelete,
  approve:  styles.actionApprove,
  return:   styles.actionReturn,
  verify:   styles.actionVerify,
  generate: styles.actionGenerate,
};

const ENTITY_TYPES = Array.from(new Set(AUDIT_LOG_SEED.map((e) => e.entityType)));

export function AdminAuditLogRoute() {
  const role = useAuthStore((s) => s.role);
  const [search, setSearch]             = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterAction, setFilterAction] = useState<'all' | AuditLogEntry['action']>('all');
  const [filterUser, setFilterUser]     = useState('');
  const [filterDate, setFilterDate]     = useState('');

  const isAdmin = role === 'admin';

  const filtered = useMemo(() => {
    return AUDIT_LOG_SEED.filter((entry) => {
      const q = search.toLowerCase();
      if (q && !entry.entityLabel.toLowerCase().includes(q) && !entry.userName.toLowerCase().includes(q)) return false;
      if (filterEntity !== 'all' && entry.entityType !== filterEntity) return false;
      if (filterAction !== 'all' && entry.action !== filterAction) return false;
      if (filterUser && !entry.userName.toLowerCase().includes(filterUser.toLowerCase())) return false;
      if (filterDate && !entry.timestamp.startsWith(filterDate)) return false;
      return true;
    });
  }, [search, filterEntity, filterAction, filterUser, filterDate]);

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
          <p className={styles.subtitle}>Immutable record of all system changes and actions. {AUDIT_LOG_SEED.length} entries.</p>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Search entity or user…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
        >
          <option value="all">All Entity Types</option>
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className={styles.select}
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value as typeof filterAction)}
        >
          <option value="all">All Actions</option>
          {(Object.keys(ACTION_LABELS) as AuditLogEntry['action'][]).map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a]}</option>
          ))}
        </select>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Filter user…"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          style={{ maxWidth: '12rem' }}
        />
        <input
          type="date"
          className={styles.select}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <p className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>

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
            {filtered.map((entry) => (
              <tr key={entry.id}>
                <td className={styles.timeCell}>
                  {new Date(entry.timestamp).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td>{entry.userName}</td>
                <td>
                  <span className={`${styles.actionBadge} ${ACTION_COLORS[entry.action] ?? ''}`}>
                    {ACTION_LABELS[entry.action]}
                  </span>
                </td>
                <td>
                  <div>
                    <span className={styles.entityType}>{entry.entityType}</span>
                    <span className={styles.entityLabel}>{entry.entityLabel}</span>
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>No entries match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../../components/ui';
import type { Incident } from '../../../incidents/types';
import { STATUS_VARIANT } from '../../../incidents/utils';
import styles from './RecentIncidentsTable.module.css';

const SEVERITY_VARIANT: Record<string, 'overdue' | 'pending' | 'info' | 'neutral'> = {
  Fatality:          'overdue',
  'Lost Time':       'overdue',
  'Medical Treatment':'pending',
  'First Aid':       'info',
  'Near Miss':       'neutral',
};

interface RecentIncidentsTableProps {
  incidents: Incident[];
}

export function RecentIncidentsTable({ incidents }: RecentIncidentsTableProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Incidents</h2>
        <button className={styles.viewAll} onClick={() => navigate('/app/incidents')}>
          View all →
        </button>
      </div>

      <div className={styles.tableWrapper} role="region" aria-label="Recent incidents">
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Incident #</th>
              <th scope="col">Date</th>
              <th scope="col">Type</th>
              <th scope="col">Severity</th>
              <th scope="col">Division</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>No incidents match the current filters.</td>
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
                  <td className={styles.incNum}>{inc.incidentNumber}</td>
                  <td>{new Date(inc.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>{inc.incidentType}</td>
                  <td>
                    {inc.severity
                      ? <Badge variant={SEVERITY_VARIANT[inc.severity] ?? 'neutral'}>{inc.severity}</Badge>
                      : <span className={styles.na}>—</span>}
                  </td>
                  <td>{inc.division || '—'}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[inc.status]}>{inc.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

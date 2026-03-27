import { Link } from 'react-router-dom';
import { Badge } from '../../../../components/ui';
import { INCIDENT_SEED } from '../../../incidents/types';
import type { RecurrenceLink } from '../../types';
import styles from './RecurrenceClusterView.module.css';

interface RecurrenceClusterViewProps {
  currentIncidentId: string;
  links: RecurrenceLink[];
}

export function RecurrenceClusterView({ currentIncidentId, links }: RecurrenceClusterViewProps) {
  if (links.length === 0) {
    return (
      <p className={styles.empty}>No recurrence links recorded for this incident.</p>
    );
  }

  return (
    <div className={styles.cluster}>
      {links.map((link) => {
        const otherId = link.incidentAId === currentIncidentId ? link.incidentBId : link.incidentAId;
        const other   = INCIDENT_SEED.find((i) => i.id === otherId);

        return (
          <div key={link.id} className={styles.card}>
            <div className={styles.cardHeader}>
              {other ? (
                <Link to={`/app/incidents/${other.id}`} className={styles.incLink}>
                  <span className={styles.incNum}>{other.incidentNumber}</span>
                  <span className={styles.incType}>{other.incidentType}</span>
                </Link>
              ) : (
                <span className={styles.incNum}>Unknown Incident</span>
              )}
              {other && (
                <span className={styles.division}>{other.division}</span>
              )}
            </div>

            <div className={styles.types}>
              {link.similarityTypes.map((t) => (
                <Badge key={t} variant="info">{t}</Badge>
              ))}
            </div>

            {link.notes && (
              <p className={styles.notes}>{link.notes}</p>
            )}

            <div className={styles.meta}>
              Linked by {link.linkedBy} on {new Date(link.linkedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

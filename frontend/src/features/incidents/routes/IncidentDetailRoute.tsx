import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui';
import { INCIDENT_SEED } from '../types';
import { STATUS_VARIANT, formatDateLong } from '../utils';
import styles from './IncidentDetailRoute.module.css';

type Tab = 'details' | 'investigation' | 'capas' | 'recurrence';
const TABS: { id: Tab; label: string }[] = [
  { id: 'details',       label: 'Details' },
  { id: 'investigation', label: 'Investigation' },
  { id: 'capas',         label: 'CAPAs' },
  { id: 'recurrence',    label: 'Recurrence' },
];

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value || '—'}</span>
    </div>
  );
}

export function IncidentDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incident = INCIDENT_SEED.find((i) => i.id === id);

  const [tab, setTab] = useState<Tab>('details');

  if (!incident) {
    return (
      <div className={styles.notFound}>
        <p>Incident not found.</p>
        <button className={styles.backBtn} onClick={() => navigate('/app/incidents')}>
          ← Back to Incidents
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/app/incidents')}>
            ← Back to Incidents
          </button>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{incident.incidentNumber}</h1>
            <Badge variant={STATUS_VARIANT[incident.status]}>{incident.status}</Badge>
          </div>
          <p className={styles.subtitle}>{incident.incidentType} · {formatDateLong(incident.dateTime)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel" className={styles.tabContent}>
        {tab === 'details' && (
          <div className={styles.detailsGrid}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Incident Information</h2>
              <DetailRow label="Type"       value={incident.incidentType} />
              <DetailRow label="Severity"   value={incident.severity || undefined} />
              <DetailRow label="Division"   value={incident.division || undefined} />
              <DetailRow label="Project"    value={incident.project} />
              <DetailRow label="Reported By" value={incident.reportedBy} />
            </section>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Location</h2>
              <DetailRow label="Description" value={incident.location.textDescription} />
              {incident.location.latitude && (
                <DetailRow
                  label="GPS"
                  value={`${incident.location.latitude.toFixed(5)}, ${incident.location.longitude?.toFixed(5)}`}
                />
              )}
              <DetailRow label="Source" value={incident.location.gpsSource === 'gps' ? 'GPS Auto-detected' : 'Manual Entry'} />
            </section>
            <section className={`${styles.card} ${styles.fullWidth}`}>
              <h2 className={styles.cardTitle}>Description</h2>
              <p className={styles.description}>{incident.description}</p>
            </section>
          </div>
        )}

        {tab === 'investigation' && (
          <div className={styles.comingSoon}>
            <span>🔍</span>
            <p>Investigation details will be available in Phase 3.</p>
          </div>
        )}

        {tab === 'capas' && (
          <div className={styles.comingSoon}>
            <span>✅</span>
            <p>CAPA details will be available in Phase 4.</p>
          </div>
        )}

        {tab === 'recurrence' && (
          <div className={styles.comingSoon}>
            <span>🔗</span>
            <p>Recurrence linking will be available in Phase 4.</p>
          </div>
        )}
      </div>
    </div>
  );
}


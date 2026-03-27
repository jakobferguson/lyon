import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge } from '../../../components/ui';
import { INCIDENT_SEED } from '../types';
import { STATUS_VARIANT, formatDateLong } from '../utils';
import { INVESTIGATION_SEED } from '../../investigations/types';
import { INVESTIGATION_STATUS_VARIANT, formatDateOnly, getEscalationTier } from '../../investigations/utils';
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

        {tab === 'investigation' && (() => {
          const investigation = INVESTIGATION_SEED.find((inv) => inv.incidentId === incident.id);
          if (!investigation) {
            return (
              <div className={styles.comingSoon}>
                <span>🔍</span>
                <p>No investigation has been opened for this incident yet.</p>
              </div>
            );
          }
          const tier = investigation.assignment
            ? getEscalationTier(investigation.assignment.targetDate, investigation.status)
            : 'none';
          return (
            <div className={styles.investigationSummary}>
              <div className={styles.invSummaryHeader}>
                <div className={styles.invSummaryTitle}>
                  <h2 className={styles.cardTitle}>Investigation Summary</h2>
                  <Badge variant={INVESTIGATION_STATUS_VARIANT[investigation.status]}>
                    {investigation.status}
                  </Badge>
                  {tier !== 'none' && (
                    <span className={`${styles.escalationPill} ${styles[tier]}`}>
                      {tier === 'tier3' ? '🚨' : tier === 'tier2' ? '⚠' : '⏰'} Overdue
                    </span>
                  )}
                </div>
                <Link
                  to={`/app/investigations/${investigation.id}`}
                  className={styles.invLink}
                >
                  View Full Investigation →
                </Link>
              </div>

              <div className={styles.invSummaryGrid}>
                <div className={styles.invSummaryCard}>
                  <span className={styles.invSummaryLabel}>Lead Investigator</span>
                  <span className={styles.invSummaryValue}>
                    {investigation.assignment?.leadInvestigator ?? <em>Unassigned</em>}
                  </span>
                </div>
                <div className={styles.invSummaryCard}>
                  <span className={styles.invSummaryLabel}>Target Date</span>
                  <span className={styles.invSummaryValue}>
                    {investigation.assignment
                      ? formatDateOnly(investigation.assignment.targetDate)
                      : '—'}
                  </span>
                </div>
                <div className={styles.invSummaryCard}>
                  <span className={styles.invSummaryLabel}>5-Why Levels</span>
                  <span className={styles.invSummaryValue}>{investigation.fiveWhys.length}</span>
                </div>
                <div className={styles.invSummaryCard}>
                  <span className={styles.invSummaryLabel}>Witness Statements</span>
                  <span className={styles.invSummaryValue}>{investigation.witnessStatements.length}</span>
                </div>
                <div className={styles.invSummaryCard}>
                  <span className={styles.invSummaryLabel}>Contributing Factors</span>
                  <span className={styles.invSummaryValue}>{investigation.contributingFactors.length}</span>
                </div>
                <div className={styles.invSummaryCard}>
                  <span className={styles.invSummaryLabel}>Review Cycles</span>
                  <span className={styles.invSummaryValue}>{investigation.reviews.length}</span>
                </div>
              </div>

              {investigation.rootCauseSummary && (
                <div className={styles.rootCauseSummaryCard}>
                  <span className={styles.invSummaryLabel}>Root Cause Summary</span>
                  <p className={styles.rootCauseText}>{investigation.rootCauseSummary}</p>
                </div>
              )}
            </div>
          );
        })()}

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


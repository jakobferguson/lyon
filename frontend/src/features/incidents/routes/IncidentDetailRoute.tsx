import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge, Button, Spinner } from '../../../components/ui';
import { useIncidentDetail } from '../api/incidents';
import { apiClient } from '../../../lib/api-client';
import { STATUS_VARIANT, formatDateLong } from '../utils';
import { useInvestigationByIncident } from '../../investigations/api/investigations';
import { INVESTIGATION_STATUS_VARIANT, formatDateOnly, getEscalationTier } from '../../investigations/utils';
import { useCapaList } from '../../capas/api/capas';
import { CAPA_STATUS_VARIANT, PRIORITY_VARIANT } from '../../capas/utils';
import { RECURRENCE_SEED } from '../../recurrence/types';
import { RecurrenceLinkForm } from '../../recurrence/components/RecurrenceLinkForm/RecurrenceLinkForm';
import { RecurrenceClusterView } from '../../recurrence/components/RecurrenceClusterView/RecurrenceClusterView';
import type { RecurrenceLink } from '../../recurrence/types';
import { useAuthStore } from '../../../stores/authStore';
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

const TIER_CLASS: Record<string, string | undefined> = {
  tier1: styles.tier1,
  tier2: styles.tier2,
  tier3: styles.tier3,
};

type PdfState = 'idle' | 'confirming' | 'generating' | 'success';

const COORDINATOR_PLUS_ROLES = ['safety_coordinator', 'safety_manager', 'division_manager', 'executive', 'admin'];
const MEDICAL_ACCESS_ROLES   = ['safety_manager', 'division_manager', 'executive', 'admin'];

function InvestigationSummaryTab({ incidentId }: { incidentId: string }) {
  const { data: investigation, isLoading } = useInvestigationByIncident(incidentId);

  if (isLoading) {
    return (
      <div className={styles.comingSoon}>
        <Spinner size="md" />
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className={styles.comingSoon}>
        <span>🔍</span>
        <p>No investigation has been opened for this incident yet.</p>
      </div>
    );
  }

  const tier = getEscalationTier(
    investigation.targetCompletionDate,
    investigation.status as Parameters<typeof getEscalationTier>[1],
  );

  return (
    <div className={styles.investigationSummary}>
      <div className={styles.invSummaryHeader}>
        <div className={styles.invSummaryTitle}>
          <h2 className={styles.cardTitle}>Investigation Summary</h2>
          <Badge variant={INVESTIGATION_STATUS_VARIANT[investigation.status as keyof typeof INVESTIGATION_STATUS_VARIANT] ?? 'neutral'}>
            {investigation.status}
          </Badge>
          {tier !== 'none' && (
            <span className={`${styles.escalationPill} ${TIER_CLASS[tier] ?? ''}`}>
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
            {investigation.leadInvestigator}
          </span>
        </div>
        <div className={styles.invSummaryCard}>
          <span className={styles.invSummaryLabel}>Target Date</span>
          <span className={styles.invSummaryValue}>
            {formatDateOnly(investigation.targetCompletionDate)}
          </span>
        </div>
        <div className={styles.invSummaryCard}>
          <span className={styles.invSummaryLabel}>5-Why Levels</span>
          <span className={styles.invSummaryValue}>{investigation.fiveWhyEntries?.length ?? 0}</span>
        </div>
        <div className={styles.invSummaryCard}>
          <span className={styles.invSummaryLabel}>Witness Statements</span>
          <span className={styles.invSummaryValue}>{investigation.witnessStatements?.length ?? 0}</span>
        </div>
        <div className={styles.invSummaryCard}>
          <span className={styles.invSummaryLabel}>Contributing Factors</span>
          <span className={styles.invSummaryValue}>{investigation.contributingFactors?.length ?? 0}</span>
        </div>
        <div className={styles.invSummaryCard}>
          <span className={styles.invSummaryLabel}>Reviews</span>
          <span className={styles.invSummaryValue}>{investigation.reviewedBy ? 1 : 0}</span>
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
}

function CapasTab({ incidentId }: { incidentId: string }) {
  const navigate = useNavigate();
  const { data, isLoading } = useCapaList({ incidentId, pageSize: 50 });
  const linkedCapas = data?.items ?? [];

  const CLOSED_STATUSES = ['Verified Effective', 'Verified Ineffective'];

  if (isLoading) {
    return <div className={styles.comingSoon}><Spinner size="md" /></div>;
  }

  return (
    <div className={styles.capasTab}>
      <div className={styles.capaTabHeader}>
        <span className={styles.capaCount}>{linkedCapas.length} CAPA{linkedCapas.length !== 1 ? 's' : ''} linked to this incident</span>
        <Button variant="accent" onClick={() => navigate('/app/capas/new')}>+ New CAPA</Button>
      </div>
      {linkedCapas.length === 0 ? (
        <div className={styles.comingSoon}>
          <span>✅</span>
          <p>No CAPAs have been linked to this incident yet.</p>
        </div>
      ) : (
        <div className={styles.capaList}>
          {linkedCapas.map((capa) => {
            const overdue = !CLOSED_STATUSES.includes(capa.status) && Date.now() > new Date(capa.dueDate).getTime();
            return (
              <Link key={capa.id} to={`/app/capas/${capa.id}`} className={styles.capaCard}>
                <div className={styles.capaCardHeader}>
                  <span className={styles.capaNum}>{capa.capaNumber}</span>
                  <div className={styles.capaBadges}>
                    <Badge variant={PRIORITY_VARIANT[capa.priority as keyof typeof PRIORITY_VARIANT] ?? 'neutral'}>{capa.priority}</Badge>
                    <Badge variant={CAPA_STATUS_VARIANT[capa.status as keyof typeof CAPA_STATUS_VARIANT] ?? 'neutral'}>{capa.status}</Badge>
                    {overdue && <Badge variant="overdue">Overdue</Badge>}
                  </div>
                </div>
                <p className={styles.capaDesc}>{capa.description}</p>
                <div className={styles.capaMeta}>
                  <span>{capa.type} · {capa.category}</span>
                  <span>Assigned to {capa.assignedTo}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function IncidentDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: incident, isLoading, isError } = useIncidentDetail(id!);
  const role = useAuthStore((s) => s.role);

  const [tab, setTab] = useState<Tab>('details');
  const [recurrenceLinks, setRecurrenceLinks] = useState<RecurrenceLink[]>(
    RECURRENCE_SEED.filter((l) => l.incidentAId === id || l.incidentBId === id),
  );
  const [pdfState, setPdfState] = useState<PdfState>('idle');

  const canGenerateReport = role ? COORDINATOR_PLUS_ROLES.includes(role) : false;
  const hasMedicalAccess  = role ? MEDICAL_ACCESS_ROLES.includes(role) : false;

  async function handleGenerateReport() {
    setPdfState('generating');
    try {
      const response = await apiClient.get(`/reports/incidents/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${incident?.incidentNumber ?? 'incident'}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfState('success');
    } catch {
      setPdfState('idle');
    }
  }

  if (isLoading) {
    return (
      <div className={styles.notFound}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !incident) {
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
            <Badge variant={STATUS_VARIANT[incident.status as keyof typeof STATUS_VARIANT] ?? 'neutral'}>{incident.status}</Badge>
          </div>
          <p className={styles.subtitle}>{incident.incidentType} · {formatDateLong(incident.dateTime)}</p>
        </div>
        {canGenerateReport && (
          <Button variant="secondary" onClick={() => setPdfState('confirming')}>
            📄 Generate Report
          </Button>
        )}
      </div>

      {/* Generate Report Modal */}
      {(pdfState === 'confirming' || pdfState === 'generating' || pdfState === 'success') && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Generate Report">
          <div className={styles.modal}>
            {pdfState === 'confirming' && (
              <>
                <h2 className={styles.modalTitle}>Generate Incident Report</h2>
                <p className={styles.modalBody}>
                  A PDF report will be generated for <strong>{incident.incidentNumber}</strong>.
                </p>
                {!hasMedicalAccess && (
                  <div className={styles.redactionNotice}>
                    <span>⚕</span>
                    <p>Medical details will be <strong>redacted</strong> from this report. Only Safety Managers and above can view medical information.</p>
                  </div>
                )}
                <div className={styles.modalActions}>
                  <Button variant="secondary" onClick={() => setPdfState('idle')}>Cancel</Button>
                  <Button variant="primary" onClick={handleGenerateReport}>Generate PDF</Button>
                </div>
              </>
            )}
            {pdfState === 'generating' && (
              <>
                <h2 className={styles.modalTitle}>Generating Report…</h2>
                <div className={styles.modalSpinner} aria-label="Loading" />
                <p className={styles.modalBody}>Please wait while your report is being prepared.</p>
              </>
            )}
            {pdfState === 'success' && (
              <>
                <div className={styles.modalSuccess}>✅</div>
                <h2 className={styles.modalTitle}>Report Ready</h2>
                <p className={styles.modalBody}>
                  The PDF report for <strong>{incident.incidentNumber}</strong> has been generated successfully. In production, it would download automatically.
                </p>
                <div className={styles.modalActions}>
                  <Button variant="primary" onClick={() => setPdfState('idle')}>Close</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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

        {tab === 'investigation' && <InvestigationSummaryTab incidentId={incident.id} />}

        {tab === 'capas' && <CapasTab incidentId={incident.id} />}

        {tab === 'recurrence' && (
          <div className={styles.recurrenceTab}>
            <RecurrenceLinkForm
              currentIncidentId={incident.id}
              existingLinks={recurrenceLinks}
              onLink={(link) => setRecurrenceLinks((prev) => [...prev, link])}
            />
            <div className={styles.clusterSection}>
              <h3 className={styles.clusterTitle}>Linked Incidents</h3>
              <RecurrenceClusterView
                currentIncidentId={incident.id}
                links={recurrenceLinks}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


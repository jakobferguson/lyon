import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge } from '../../../components/ui';
import { INVESTIGATION_SEED } from '../types';
import { INVESTIGATION_STATUS_VARIANT, getEscalationTier } from '../utils';
import { OverdueEscalationBanner } from '../components/OverdueEscalationBanner/OverdueEscalationBanner';
import { InvestigationPanel } from '../components/InvestigationPanel/InvestigationPanel';
import { FiveWhyBuilder } from '../components/FiveWhyBuilder/FiveWhyBuilder';
import { ContributingFactorForm } from '../components/ContributingFactorForm/ContributingFactorForm';
import { WitnessStatementForm } from '../components/WitnessStatementForm/WitnessStatementForm';
import { ReviewPanel } from '../components/ReviewPanel/ReviewPanel';
import styles from './InvestigationDetailRoute.module.css';

type Tab = 'assignment' | 'five-why' | 'factors' | 'witnesses' | 'review';

const TABS: { id: Tab; label: string }[] = [
  { id: 'assignment',  label: 'Assignment' },
  { id: 'five-why',    label: '5-Why Analysis' },
  { id: 'factors',     label: 'Contributing Factors' },
  { id: 'witnesses',   label: 'Witness Statements' },
  { id: 'review',      label: 'Review' },
];

export function InvestigationDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const investigation = INVESTIGATION_SEED.find((inv) => inv.id === id);
  const [tab, setTab] = useState<Tab>('assignment');

  if (!investigation) {
    return (
      <div className={styles.notFound}>
        <p>Investigation not found.</p>
        <button className={styles.backBtn} onClick={() => navigate('/app/investigations')}>
          ← Back to Investigations
        </button>
      </div>
    );
  }

  const escalationTier = investigation.assignment
    ? getEscalationTier(investigation.assignment.targetDate, investigation.status)
    : 'none';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/app/investigations')}>
            ← Back to Investigations
          </button>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Investigation — {investigation.incidentNumber}</h1>
            <Badge variant={INVESTIGATION_STATUS_VARIANT[investigation.status]}>
              {investigation.status}
            </Badge>
          </div>
          <div className={styles.metaRow}>
            <span>{investigation.severity}</span>
            <span className={styles.dot}>·</span>
            <span>{investigation.division || 'No Division'}</span>
            <span className={styles.dot}>·</span>
            <Link to={`/app/incidents/${investigation.incidentId}`} className={styles.incidentLink}>
              View Incident {investigation.incidentNumber} →
            </Link>
          </div>
        </div>
      </div>

      {/* Escalation banner */}
      {investigation.assignment && (
        <OverdueEscalationBanner
          tier={escalationTier}
          targetDate={investigation.assignment.targetDate}
        />
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
        {tab === 'assignment' && (
          <InvestigationPanel investigation={investigation} />
        )}

        {tab === 'five-why' && (
          <FiveWhyBuilder
            steps={investigation.fiveWhys}
            rootCauseSummary={investigation.rootCauseSummary}
            status={investigation.status}
          />
        )}

        {tab === 'factors' && (
          <ContributingFactorForm
            factors={investigation.contributingFactors}
            status={investigation.status}
          />
        )}

        {tab === 'witnesses' && (
          <WitnessStatementForm
            statements={investigation.witnessStatements}
            status={investigation.status}
          />
        )}

        {tab === 'review' && (
          <ReviewPanel investigation={investigation} />
        )}
      </div>
    </div>
  );
}

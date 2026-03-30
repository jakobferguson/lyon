import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge, Spinner } from '../../../components/ui';
import { useInvestigationDetail } from '../api/investigations';
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
  const { data: investigation, isLoading, isError } = useInvestigationDetail(id!);
  const [tab, setTab] = useState<Tab>('assignment');

  if (isLoading) {
    return (
      <div className={styles.notFound}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !investigation) {
    return (
      <div className={styles.notFound}>
        <p>Investigation not found.</p>
        <button className={styles.backBtn} onClick={() => navigate('/app/investigations')}>
          ← Back to Investigations
        </button>
      </div>
    );
  }

  const escalationTier = getEscalationTier(investigation.targetCompletionDate, investigation.status as Parameters<typeof getEscalationTier>[1]);

  // Map API response to the shape expected by child components
  const mapped = {
    id: investigation.id,
    incidentId: investigation.incidentId,
    incidentNumber: `INV-${investigation.investigationNumber}`,
    severity: undefined,
    division: undefined,
    project: undefined,
    status: investigation.status as import('../types').InvestigationStatus,
    assignment: {
      leadInvestigator: investigation.leadInvestigator,
      leadInvestigatorId: investigation.leadInvestigatorId,
      teamMembers: investigation.teamMembers.map((tm) => tm.displayName),
      targetDate: investigation.targetCompletionDate,
      assignedBy: investigation.assignedBy,
      assignedAt: investigation.createdAt,
    },
    fiveWhys: investigation.fiveWhyEntries.map((e) => ({
      id: e.id,
      why: e.whyQuestion,
      answer: e.answer,
      evidence: e.supportingEvidence ?? '',
    })),
    rootCauseSummary: investigation.rootCauseSummary ?? '',
    contributingFactors: investigation.contributingFactors.map((cf) => ({
      factorId: cf.factorTypeId,
      factorName: cf.factorName,
      category: cf.factorCategory as import('../types').FactorCategory,
      isPrimary: cf.isPrimary,
      notes: cf.notes ?? '',
    })),
    witnessStatements: investigation.witnessStatements.map((ws) => ({
      id: ws.id,
      witnessName: ws.witnessName,
      jobTitle: ws.jobTitle ?? '',
      employer: ws.employer ?? '',
      phone: ws.phone ?? '',
      statementText: ws.statementText,
      collectionDate: ws.collectionDate,
      collectedBy: ws.collectedBy,
      submittedAt: ws.createdAt,
    })),
    reviews: investigation.reviewedBy
      ? [{
          id: investigation.id,
          action: (investigation.status === 'Approved' ? 'Approved' : 'Returned') as 'Approved' | 'Returned',
          reviewedBy: investigation.reviewedBy,
          reviewedAt: investigation.reviewedAt ?? investigation.createdAt,
          comments: investigation.reviewComments ?? '',
        }]
      : [],
    createdAt: investigation.createdAt,
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/app/investigations')}>
            ← Back to Investigations
          </button>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Investigation — {mapped.incidentNumber}</h1>
            <Badge variant={INVESTIGATION_STATUS_VARIANT[mapped.status] ?? 'neutral'}>
              {mapped.status}
            </Badge>
          </div>
          <div className={styles.metaRow}>
            <span>{investigation.leadInvestigator}</span>
            <span className={styles.dot}>·</span>
            <Link to={`/app/incidents/${investigation.incidentId}`} className={styles.incidentLink}>
              View Parent Incident →
            </Link>
          </div>
        </div>
      </div>

      {/* Escalation banner */}
      <OverdueEscalationBanner
        tier={escalationTier}
        targetDate={investigation.targetCompletionDate}
      />

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
          <InvestigationPanel investigation={mapped} />
        )}

        {tab === 'five-why' && (
          <FiveWhyBuilder
            investigationId={investigation.id}
            steps={mapped.fiveWhys}
            rootCauseSummary={mapped.rootCauseSummary}
            status={mapped.status}
          />
        )}

        {tab === 'factors' && (
          <ContributingFactorForm
            investigationId={investigation.id}
            factors={mapped.contributingFactors}
            status={mapped.status}
          />
        )}

        {tab === 'witnesses' && (
          <WitnessStatementForm
            investigationId={investigation.id}
            statements={mapped.witnessStatements}
            status={mapped.status}
          />
        )}

        {tab === 'review' && (
          <ReviewPanel investigation={mapped} investigationId={investigation.id} />
        )}
      </div>
    </div>
  );
}

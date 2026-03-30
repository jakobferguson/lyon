import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Badge, Button, FormField, Spinner } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import type { CapaStatus } from '../types';
import { useCapaDetail, useTransitionCapa } from '../api/capas';
import {
  CAPA_STATUS_VARIANT,
  PRIORITY_VARIANT,
  formatDateOnly,
  formatDateShort,
} from '../utils';
import { CapaStatusStepper } from '../components/CapaStatusStepper/CapaStatusStepper';
import { CapaVerificationForm } from '../components/CapaVerificationForm/CapaVerificationForm';
import styles from './CapaDetailRoute.module.css';

export function CapaDetailRoute() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const { data: capa, isLoading, isError } = useCapaDetail(id!);
  const transitionMutation = useTransitionCapa();

  const [completionNotes, setCompletionNotes] = useState('');
  const [notesInitialized, setNotesInitialized] = useState(false);

  // Initialize completionNotes from server data once
  if (capa && !notesInitialized) {
    setCompletionNotes(capa.completionNotes ?? '');
    setNotesInitialized(true);
  }

  if (isLoading) {
    return (
      <div className={styles.notFound}><Spinner size="lg" /></div>
    );
  }

  if (isError || !capa) {
    return (
      <div className={styles.notFound}>
        <h2>CAPA not found</h2>
        <Link to="/app/capas">← Back to CAPAs</Link>
      </div>
    );
  }

  const currentUserId   = user?.id   ?? '';
  const currentUserName = user?.name ?? 'Unknown User';
  const isAssignee      = currentUserId === capa.assignedToId;
  const overdue         = new Date(capa.dueDate) < new Date() && !['Verified Effective', 'Verified Ineffective'].includes(capa.status);

  function handleAdvance(next: CapaStatus) {
    transitionMutation.mutate({
      id: capa!.id,
      newStatus: next,
      completionNotes: next === 'Completed' ? completionNotes : undefined,
    });
  }

  function handleVerify(outcome: 'Verified Effective' | 'Verified Ineffective', notes: string) {
    transitionMutation.mutate({
      id: capa!.id,
      newStatus: outcome,
      verificationNotes: notes,
      verifiedById: currentUserId,
    });
  }

  function handleSaveNotes() {
    // Save notes by transitioning to same status with updated notes
    transitionMutation.mutate({
      id: capa!.id,
      newStatus: capa!.status,
      completionNotes,
    });
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link to="/app/capas" className={styles.back}>← CAPAs</Link>
        </div>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.capaNum}>{capa.capaNumber}</h1>
            <p className={styles.type}>{capa.type} · {capa.category}</p>
          </div>
          <div className={styles.badges}>
            <Badge variant={PRIORITY_VARIANT[capa.priority as keyof typeof PRIORITY_VARIANT] ?? 'neutral'}>{capa.priority}</Badge>
            <Badge variant={CAPA_STATUS_VARIANT[capa.status as keyof typeof CAPA_STATUS_VARIANT] ?? 'neutral'}>{capa.status}</Badge>
            {overdue && <Badge variant="overdue">Overdue</Badge>}
          </div>
        </div>
      </div>

      {overdue && (
        <div className={styles.overdueBanner} role="alert">
          ⚠ This CAPA is overdue. Action was due by {formatDateOnly(capa.dueDate)}.
        </div>
      )}

      <div className={styles.layout}>
        {/* Main column */}
        <div className={styles.main}>

          {/* Status Stepper */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Status & Progress</h2>
            <CapaStatusStepper
              status={capa.status as CapaStatus}
              onAdvance={handleAdvance}
              isAssignee={isAssignee}
            />
          </section>

          {/* Description */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Description</h2>
            <p className={styles.body}>{capa.description}</p>
          </section>

          {/* Completion Notes */}
          {(capa.status === 'In Progress' || capa.status === 'Completed' ||
            capa.status === 'Verification Pending' || capa.status === 'Verified Effective' ||
            capa.status === 'Verified Ineffective') && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Completion Notes</h2>
              {capa.status === 'In Progress' ? (
                <>
                  <FormField label="Document actions taken">
                    {(fid) => (
                      <textarea
                        id={fid}
                        className="lyon-input"
                        rows={4}
                        placeholder="Describe actions taken so far…"
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                      />
                    )}
                  </FormField>
                  <div className={styles.notesAction}>
                    <Button variant="secondary" onClick={handleSaveNotes} disabled={transitionMutation.isPending}>
                      {transitionMutation.isPending ? 'Saving…' : 'Save Notes'}
                    </Button>
                  </div>
                </>
              ) : (
                <p className={styles.body}>{capa.completionNotes || <em className={styles.muted}>No completion notes recorded.</em>}</p>
              )}
            </section>
          )}

          {/* Verification */}
          {capa.status !== 'Open' && capa.status !== 'In Progress' && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Verification</h2>
              <CapaVerificationForm
                capa={{
                  ...capa,
                  assignedToId: capa.assignedToId,
                  verifiedById: capa.verifiedById ?? null,
                  verifiedBy: capa.verifiedBy ?? null,
                  verifiedAt: capa.verifiedAt ?? null,
                  verificationNotes: capa.verificationNotes ?? '',
                  completionNotes: capa.completionNotes ?? '',
                  status: capa.status as CapaStatus,
                  priority: capa.priority as import('../types').CapaPriority,
                  type: capa.type as import('../types').CapaType,
                  category: capa.category as import('../types').CapaCategory,
                  dueDate: capa.dueDate,
                  verificationDueDate: capa.verificationDueDate ?? '',
                  verificationMethod: capa.verificationMethod ?? '',
                  linkedIncidentIds: capa.linkedIncidents?.map((i) => i.id) ?? [],
                  linkedInvestigationId: null,
                  createdBy: '',
                  completedAt: capa.completedAt ?? null,
                }}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onVerify={handleVerify}
                onNewCapa={() => navigate('/app/capas/new')}
                onReopenInvestigation={() => navigate('/app/investigations')}
              />
            </section>
          )}
        </div>

        {/* Side column */}
        <aside className={styles.side}>

          {/* Details */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Details</h2>
            <dl className={styles.dl}>
              <dt>Assigned To</dt>   <dd>{capa.assignedTo}</dd>
              <dt>Priority</dt>      <dd><Badge variant={PRIORITY_VARIANT[capa.priority as keyof typeof PRIORITY_VARIANT] ?? 'neutral'}>{capa.priority}</Badge></dd>
              <dt>Action Due</dt>    <dd className={overdue ? styles.overdueText : ''}>{formatDateOnly(capa.dueDate)}</dd>
              <dt>Verification Due</dt><dd>{capa.verificationDueDate ? formatDateOnly(capa.verificationDueDate) : '—'}</dd>
              <dt>Created At</dt>    <dd>{formatDateShort(capa.createdAt)}</dd>
            </dl>
          </div>

          {/* Verification Method */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Verification Method</h2>
            <p className={styles.body}>{capa.verificationMethod ?? '—'}</p>
          </div>

          {/* Linked Incidents */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Linked Incidents</h2>
            {(!capa.linkedIncidents || capa.linkedIncidents.length === 0) ? (
              <p className={styles.muted}>No incidents linked.</p>
            ) : (
              <ul className={styles.linkList}>
                {capa.linkedIncidents.map((inc) => (
                  <li key={inc.id}>
                    <Link to={`/app/incidents/${inc.id}`} className={styles.incLink}>
                      <span className={styles.incNum}>{inc.incidentNumber}</span>
                      <span className={styles.incDesc}>{inc.incidentType}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Badge, Button, FormField } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import type { Capa, CapaStatus } from '../types';
import { CAPA_SEED } from '../types';
import { INCIDENT_SEED } from '../../incidents/types';
import {
  CAPA_STATUS_VARIANT,
  PRIORITY_VARIANT,
  formatDateOnly,
  formatDateShort,
  isOverdue,
  calculateVerificationDueDate,
  toDateInputValue,
} from '../utils';
import { CapaStatusStepper } from '../components/CapaStatusStepper/CapaStatusStepper';
import { CapaVerificationForm } from '../components/CapaVerificationForm/CapaVerificationForm';
import styles from './CapaDetailRoute.module.css';

export function CapaDetailRoute() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuthStore();

  const seed = CAPA_SEED.find((c) => c.id === id);
  const [capa, setCapa] = useState<Capa | undefined>(seed);

  const [completionNotes, setCompletionNotes] = useState(capa?.completionNotes ?? '');
  const [savingNotes, setSavingNotes]         = useState(false);

  if (!capa) {
    return (
      <div className={styles.notFound}>
        <h2>CAPA not found</h2>
        <Link to="/app/capas">← Back to CAPAs</Link>
      </div>
    );
  }

  const currentUserId   = user?.id   ?? 'user-griffith';
  const currentUserName = user?.name ?? 'T. Griffith';
  const isAssignee      = currentUserId === capa.assignedToId;
  const overdue         = isOverdue(capa);

  const linkedIncidents = INCIDENT_SEED.filter((inc) => capa.linkedIncidentIds.includes(inc.id));

  function handleAdvance(next: CapaStatus) {
    setCapa((prev) => {
      if (!prev) return prev;
      const updates: Partial<Capa> = { status: next };
      if (next === 'Completed') {
        updates.completedAt = new Date().toISOString();
        updates.completionNotes = completionNotes;
      }
      if (next === 'Verification Pending') {
        const verDue = calculateVerificationDueDate(prev.priority, new Date());
        updates.verificationDueDate = toDateInputValue(verDue);
      }
      return { ...prev, ...updates };
    });
  }

  function handleVerify(outcome: 'Verified Effective' | 'Verified Ineffective', notes: string) {
    setCapa((prev) => prev ? {
      ...prev,
      status: outcome,
      verifiedBy: currentUserName,
      verifiedById: currentUserId,
      verifiedAt: new Date().toISOString(),
      verificationNotes: notes,
    } : prev);
  }

  function handleSaveNotes() {
    setSavingNotes(true);
    setTimeout(() => {
      setCapa((prev) => prev ? { ...prev, completionNotes } : prev);
      setSavingNotes(false);
    }, 400);
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
            <Badge variant={PRIORITY_VARIANT[capa.priority]}>{capa.priority}</Badge>
            <Badge variant={CAPA_STATUS_VARIANT[capa.status]}>{capa.status}</Badge>
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
              status={capa.status}
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
                    <Button variant="secondary" onClick={handleSaveNotes} disabled={savingNotes}>
                      {savingNotes ? 'Saving…' : 'Save Notes'}
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
                capa={capa}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onVerify={handleVerify}
                onNewCapa={() => navigate('/app/capas/new')}
                onReopenInvestigation={() =>
                  capa.linkedInvestigationId
                    ? navigate(`/app/investigations/${capa.linkedInvestigationId}`)
                    : navigate('/app/investigations')
                }
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
              <dt>Priority</dt>      <dd><Badge variant={PRIORITY_VARIANT[capa.priority]}>{capa.priority}</Badge></dd>
              <dt>Action Due</dt>    <dd className={overdue ? styles.overdueText : ''}>{formatDateOnly(capa.dueDate)}</dd>
              <dt>Verification Due</dt><dd>{formatDateOnly(capa.verificationDueDate)}</dd>
              <dt>Created By</dt>    <dd>{capa.createdBy}</dd>
              <dt>Created At</dt>    <dd>{formatDateShort(capa.createdAt)}</dd>
            </dl>
          </div>

          {/* Verification Method */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Verification Method</h2>
            <p className={styles.body}>{capa.verificationMethod}</p>
          </div>

          {/* Linked Incidents */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Linked Incidents</h2>
            {linkedIncidents.length === 0 ? (
              <p className={styles.muted}>No incidents linked.</p>
            ) : (
              <ul className={styles.linkList}>
                {linkedIncidents.map((inc) => (
                  <li key={inc.id}>
                    <Link to={`/app/incidents/${inc.id}`} className={styles.incLink}>
                      <span className={styles.incNum}>{inc.incidentNumber}</span>
                      <span className={styles.incDesc}>{inc.incidentType} · {inc.division}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Linked Investigation */}
          {capa.linkedInvestigationId && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Linked Investigation</h2>
              <Link to={`/app/investigations/${capa.linkedInvestigationId}`} className={styles.invLink}>
                View Investigation →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

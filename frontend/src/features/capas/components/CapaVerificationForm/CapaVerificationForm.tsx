import { useState } from 'react';
import { Button, FormField, Modal } from '../../../../components/ui';
import type { Capa, CapaStatus } from '../../types';
import styles from './CapaVerificationForm.module.css';

interface CapaVerificationFormProps {
  capa: Capa;
  currentUserId: string;
  currentUserName: string;
  onVerify: (outcome: 'Verified Effective' | 'Verified Ineffective', notes: string) => void;
  onNewCapa: () => void;
  onReopenInvestigation: () => void;
}

export function CapaVerificationForm({
  capa,
  currentUserId,
  currentUserName,
  onVerify,
  onNewCapa,
  onReopenInvestigation,
}: CapaVerificationFormProps) {
  const [notes, setNotes]                   = useState('');
  const [notesError, setNotesError]         = useState('');
  const [ineffectiveOpen, setIneffectiveOpen] = useState(false);

  const isSameUser = currentUserId === capa.assignedToId;
  const isTerminal: CapaStatus[] = ['Verified Effective', 'Verified Ineffective'];

  if (isTerminal.includes(capa.status)) {
    return (
      <div className={styles.history}>
        <h3 className={styles.histTitle}>Verification Record</h3>
        <div className={styles.histRow}>
          <span className={styles.histLabel}>Outcome</span>
          <span className={`${styles.outcome} ${capa.status === 'Verified Effective' ? styles.effective : styles.ineffective}`}>
            {capa.status}
          </span>
        </div>
        <div className={styles.histRow}>
          <span className={styles.histLabel}>Verified By</span>
          <span>{capa.verifiedBy ?? '—'}</span>
        </div>
        <div className={styles.histRow}>
          <span className={styles.histLabel}>Verified At</span>
          <span>{capa.verifiedAt ? new Date(capa.verifiedAt).toLocaleString() : '—'}</span>
        </div>
        {capa.verificationNotes && (
          <div className={styles.histNotes}>
            <span className={styles.histLabel}>Notes</span>
            <p>{capa.verificationNotes}</p>
          </div>
        )}
      </div>
    );
  }

  if (capa.status !== 'Verification Pending') {
    return (
      <p className={styles.hint}>
        Verification will be available once the CAPA is submitted for verification.
      </p>
    );
  }

  if (isSameUser) {
    return (
      <div className={styles.blocked}>
        <span className={styles.blockIcon} aria-hidden="true">⚠</span>
        <p>
          The assignee cannot verify their own CAPA. A different team member must perform the verification.
        </p>
      </div>
    );
  }

  function handleEffective() {
    if (!notes.trim()) {
      setNotesError('Verification notes are required.');
      return;
    }
    setNotesError('');
    onVerify('Verified Effective', notes);
  }

  function handleIneffective() {
    if (!notes.trim()) {
      setNotesError('Verification notes are required before marking ineffective.');
      return;
    }
    setNotesError('');
    setIneffectiveOpen(true);
  }

  return (
    <>
      <div className={styles.form}>
        <div className={styles.verifierInfo}>
          Verifying as <strong>{currentUserName}</strong>
        </div>

        <FormField label="Verification Notes" required error={notesError}>
          {(id) => (
            <textarea
              id={id}
              className="lyon-input"
              rows={4}
              placeholder="Document what was observed during verification, evidence reviewed, field audit findings…"
              value={notes}
              onChange={(e) => { setNotes(e.target.value); if (notesError) setNotesError(''); }}
            />
          )}
        </FormField>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleIneffective}>
            Verified Ineffective
          </Button>
          <Button variant="accent" onClick={handleEffective}>
            Verified Effective
          </Button>
        </div>
      </div>

      {/* Ineffective prompt modal */}
      <Modal
        open={ineffectiveOpen}
        onClose={() => setIneffectiveOpen(false)}
        title="CAPA Verified Ineffective"
      >
        <div className={styles.modalBody}>
          <p className={styles.modalText}>
            This CAPA has been marked <strong>Verified Ineffective</strong>. The root cause has not been adequately addressed.
            What should happen next?
          </p>
          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => {
                setIneffectiveOpen(false);
                onVerify('Verified Ineffective', notes);
                onReopenInvestigation();
              }}
            >
              Reopen Investigation
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                setIneffectiveOpen(false);
                onVerify('Verified Ineffective', notes);
                onNewCapa();
              }}
            >
              Create New CAPA
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

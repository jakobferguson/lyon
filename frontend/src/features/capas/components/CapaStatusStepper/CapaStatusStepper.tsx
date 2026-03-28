import { Button } from '../../../../components/ui';
import type { CapaStatus } from '../../types';
import styles from './CapaStatusStepper.module.css';

interface CapaStatusStepperProps {
  status: CapaStatus;
  onAdvance: (nextStatus: CapaStatus) => void;
  isAssignee: boolean;
}

const STEPS: CapaStatus[] = [
  'Open',
  'In Progress',
  'Completed',
  'Verification Pending',
  'Verified Effective',
];

// Map each status to what comes next and who can advance it
const TRANSITIONS: Partial<Record<CapaStatus, { next: CapaStatus; label: string; assigneeOnly: boolean }>> = {
  'Open':                  { next: 'In Progress',         label: 'Start Work',              assigneeOnly: true },
  'In Progress':           { next: 'Completed',           label: 'Mark as Completed',        assigneeOnly: true },
  'Completed':             { next: 'Verification Pending', label: 'Submit for Verification',  assigneeOnly: true },
};

function getStepIndex(status: CapaStatus): number {
  const idx = STEPS.indexOf(status);
  if (status === 'Verified Ineffective') return STEPS.length; // past the main line
  return idx === -1 ? 0 : idx;
}

export function CapaStatusStepper({ status, onAdvance, isAssignee }: CapaStatusStepperProps) {
  const currentIndex = getStepIndex(status);
  const transition = TRANSITIONS[status];
  const isTerminal = status === 'Verified Effective' || status === 'Verified Ineffective';

  return (
    <div className={styles.wrapper}>
      {/* Visual stepper track */}
      <div className={styles.track} aria-label="CAPA status progress">
        {STEPS.map((step, idx) => {
          const isDone    = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step} className={styles.stepGroup}>
              <div className={`${styles.step} ${isDone ? styles.done : isCurrent ? styles.current : styles.future}`}>
                <div className={styles.dot} aria-hidden="true">
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className={styles.stepLabel}>{step}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} aria-hidden="true" />
              )}
            </div>
          );
        })}

        {/* Ineffective branch */}
        {(status === 'Verification Pending' || status === 'Verified Ineffective') && (
          <div className={styles.ineffectiveBranch}>
            <div className={styles.branchLine} aria-hidden="true" />
            <div className={`${styles.step} ${status === 'Verified Ineffective' ? styles.current : styles.future}`}>
              <div className={`${styles.dot} ${styles.dotDanger}`} aria-hidden="true">!</div>
              <span className={styles.stepLabel}>Verified Ineffective</span>
            </div>
          </div>
        )}
      </div>

      {/* Current status label */}
      <div className={styles.statusRow}>
        <span className={styles.currentLabel}>
          Current status: <strong>{status}</strong>
        </span>
        {isTerminal && (
          <span className={`${styles.terminalBadge} ${status === 'Verified Effective' ? styles.effective : styles.ineffective}`}>
            {status === 'Verified Effective' ? 'Closed — Effective' : 'Closed — Ineffective'}
          </span>
        )}
      </div>

      {/* Transition action */}
      {transition && (
        <div className={styles.action}>
          {!isAssignee && transition.assigneeOnly ? (
            <p className={styles.actionNote}>Only the assigned team member can advance this CAPA.</p>
          ) : (
            <Button variant="accent" onClick={() => onAdvance(transition.next)}>
              {transition.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

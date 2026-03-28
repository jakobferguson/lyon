import { Badge } from '../../../../components/ui';
import type { Investigation } from '../../types';
import { INVESTIGATION_STATUS_VARIANT, formatDateOnly, formatDateShort, getEscalationTier } from '../../utils';
import styles from './InvestigationPanel.module.css';

interface InvestigationPanelProps {
  investigation: Investigation;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

export function InvestigationPanel({ investigation }: InvestigationPanelProps) {
  const { assignment, status } = investigation;

  const tier = assignment
    ? getEscalationTier(assignment.targetDate, status)
    : 'none';

  const isOverdue = tier !== 'none';

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Investigation Assignment</h2>
          <Badge variant={INVESTIGATION_STATUS_VARIANT[status]}>{status}</Badge>
        </div>
        {isOverdue && assignment && (
          <div className={styles.overduePill} aria-label="Investigation overdue">
            ⚠ Overdue — {getDaysLabel(assignment.targetDate)}
          </div>
        )}
      </div>

      {assignment ? (
        <div className={styles.grid}>
          <InfoRow label="Lead Investigator" value={assignment.leadInvestigator} />
          <InfoRow label="Assigned By" value={assignment.assignedBy} />
          <InfoRow
            label="Team Members"
            value={
              assignment.teamMembers.length > 0
                ? assignment.teamMembers.join(', ')
                : <span className={styles.none}>None assigned</span>
            }
          />
          <InfoRow label="Assigned On" value={formatDateShort(assignment.assignedAt)} />
          <InfoRow
            label="Target Completion"
            value={
              <span className={isOverdue ? styles.overdueDate : undefined}>
                {formatDateOnly(assignment.targetDate)}
                {isOverdue && ' (Overdue)'}
              </span>
            }
          />
        </div>
      ) : (
        <p className={styles.unassigned}>No investigator has been assigned yet.</p>
      )}
    </div>
  );
}

function getDaysLabel(targetDate: string): string {
  const days = Math.floor((Date.now() - new Date(targetDate).getTime()) / (24 * 60 * 60 * 1000));
  if (days === 1) return '1 day past target';
  return `${days} days past target`;
}

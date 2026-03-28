import type { EscalationTier } from '../../utils';
import { getDaysOverdue } from '../../utils';
import styles from './OverdueEscalationBanner.module.css';

interface OverdueEscalationBannerProps {
  tier: EscalationTier;
  targetDate: string;
}

const TIER_META = {
  tier1: {
    label: 'Overdue',
    description: (days: number) => `This investigation is ${days} day${days !== 1 ? 's' : ''} past its target completion date. Lead investigator and Safety Manager have been notified.`,
  },
  tier2: {
    label: 'Significantly Overdue',
    description: (days: number) => `This investigation is ${days} days past its target completion date. Division Manager has been notified.`,
  },
  tier3: {
    label: 'Critically Overdue',
    description: (days: number) => `This investigation is ${days} days past its target completion date. Safety Manager, Division Manager, and Executive leadership have been notified. A persistent alert is active.`,
  },
};

export function OverdueEscalationBanner({ tier, targetDate }: OverdueEscalationBannerProps) {
  if (tier === 'none') return null;

  const days = getDaysOverdue(targetDate);
  const meta = TIER_META[tier];

  return (
    <div className={`${styles.banner} ${styles[tier]}`} role="alert" aria-live="polite">
      <div className={styles.icon} aria-hidden="true">
        {tier === 'tier3' ? '🚨' : tier === 'tier2' ? '⚠️' : '⏰'}
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{meta.label}</span>
        <span className={styles.description}>{meta.description(days)}</span>
      </div>
    </div>
  );
}

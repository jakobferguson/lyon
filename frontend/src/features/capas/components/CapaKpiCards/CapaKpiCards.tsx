import { computeKpis } from '../../utils';
import { CAPA_SEED } from '../../types';
import styles from './CapaKpiCards.module.css';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: 'default' | 'danger' | 'success';
}

function KpiCard({ label, value, sub, variant = 'default' }: KpiCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}

export function CapaKpiCards() {
  const { open, overdue, effectivenessRate, avgCloseDays } = computeKpis(CAPA_SEED);

  return (
    <div className={styles.grid}>
      <KpiCard
        label="Open CAPAs"
        value={String(open)}
        variant="default"
      />
      <KpiCard
        label="Overdue CAPAs"
        value={String(overdue)}
        variant={overdue > 0 ? 'danger' : 'default'}
      />
      <KpiCard
        label="Avg Time to Close"
        value={avgCloseDays !== null ? `${avgCloseDays}d` : '—'}
        sub="days from creation to verified"
        variant="default"
      />
      <KpiCard
        label="Effectiveness Rate"
        value={effectivenessRate !== null ? `${effectivenessRate}%` : '—'}
        sub="of verified CAPAs"
        variant={effectivenessRate !== null && effectivenessRate >= 80 ? 'success' : 'default'}
      />
    </div>
  );
}

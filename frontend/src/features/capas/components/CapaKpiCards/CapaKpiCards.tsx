import { useCapaList } from '../../api/capas';
import { computeKpis } from '../../utils';
import type { Capa } from '../../types';
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
  const { data } = useCapaList({ pageSize: 100 });
  const items = data?.items ?? [];

  // Map API items to the shape computeKpis expects
  const mapped = items.map((c) => ({
    status: c.status,
    dueDate: c.dueDate,
    createdAt: '', // not available from list item
    verifiedAt: null as string | null,
    completedAt: null as string | null,
  })) as Pick<Capa, 'status' | 'dueDate' | 'createdAt' | 'verifiedAt' | 'completedAt'>[];

  const { open, overdue, effectivenessRate, avgCloseDays } = computeKpis(mapped as Capa[]);

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

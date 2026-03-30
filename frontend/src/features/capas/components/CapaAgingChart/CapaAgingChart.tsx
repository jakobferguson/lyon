import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCapaList } from '../../api/capas';
import type { AgeBucket } from '../../utils';
import { getAgeBucket } from '../../utils';
import styles from './CapaAgingChart.module.css';

const BUCKETS: AgeBucket[] = ['<7d', '7–14d', '14–30d', '30–60d', '>60d'];

const BUCKET_COLORS: Record<AgeBucket, string> = {
  '<7d':   '#22c55e',
  '7–14d': '#c8a45a',
  '14–30d':'#f59e0b',
  '30–60d':'#ea580c',
  '>60d':  '#dc2626',
};

export function CapaAgingChart() {
  const { data } = useCapaList({ pageSize: 100 });
  const allCapas = data?.items ?? [];

  // Only count open (non-closed) CAPAs
  const openCapas = allCapas.filter((c) => !['VerifiedEffective', 'VerifiedIneffective', 'Verified Effective', 'Verified Ineffective'].includes(c.status));

  const counts = BUCKETS.map((bucket) => ({
    bucket,
    // Use dueDate as a proxy since createdAt isn't on the list item
    count: openCapas.filter((c) => getAgeBucket(c.dueDate) === bucket).length,
    color: BUCKET_COLORS[bucket],
  }));

  const total = openCapas.length;
  const overdueCount = openCapas.filter((c) => new Date(c.dueDate) < new Date()).length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Open CAPA Aging</h3>
          <p className={styles.subtitle}>
            {total} open CAPAs · {overdueCount} overdue
          </p>
        </div>
      </div>

      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={counts} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis
              dataKey="bucket"
              tick={{ fill: '#888', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#888', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface, #1a1a1a)',
                border: '1px solid var(--color-border, #2a2a2a)',
                borderRadius: '6px',
                color: 'var(--color-text-primary, #f5f5f5)',
                fontSize: '0.875rem',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              formatter={(value) => [`${value} CAPAs`, 'Count']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {counts.map((entry) => (
                <Cell key={entry.bucket} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        {BUCKETS.map((b) => (
          <span key={b} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: BUCKET_COLORS[b] }} />
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

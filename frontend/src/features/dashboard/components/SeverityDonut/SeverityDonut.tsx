import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SeverityRecord } from '../../types';
import { CHART_TOOLTIP_STYLE } from '../../types';
import styles from './SeverityDonut.module.css';

interface SeverityDonutProps {
  data: SeverityRecord[];
}

export function SeverityDonut({ data }: SeverityDonutProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Severity Distribution</h3>
      <p className={styles.subtitle}>{total} incidents total</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="severity"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.severity} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value, name) => [
              `${value} (${Math.round((Number(value) / total) * 100)}%)`,
              name,
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.75rem' }}
            iconSize={10}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#aaa' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

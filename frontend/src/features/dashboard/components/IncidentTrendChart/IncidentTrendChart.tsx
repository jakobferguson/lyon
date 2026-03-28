import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { MonthlyIncidentRecord } from '../../types';
import { INCIDENT_TYPE_COLORS, INCIDENT_TYPES, CHART_TOOLTIP_STYLE } from '../../types';
import styles from './IncidentTrendChart.module.css';

interface IncidentTrendChartProps {
  data: MonthlyIncidentRecord[];
}

export function IncidentTrendChart({ data }: IncidentTrendChartProps) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Incident Trend by Month</h3>
      <p className={styles.subtitle}>12-month rolling window by type</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#888', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#888', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }}
            iconSize={10}
            iconType="square"
          />
          {INCIDENT_TYPES.map((type) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="a"
              fill={INCIDENT_TYPE_COLORS[type]}
              radius={type === 'Utility Strike' ? [4, 4, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

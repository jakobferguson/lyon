import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { DivisionIncidentRecord } from '../../types';
import styles from './DivisionChart.module.css';

const COLORS: Record<string, string> = {
  Injury:           '#dc2626',
  'Near Miss':      '#c8a45a',
  'Property Damage':'#3b82f6',
  Environmental:    '#22c55e',
  Vehicle:          '#a855f7',
  Fire:             '#f97316',
  'Utility Strike': '#06b6d4',
};

const TYPES = ['Injury', 'Near Miss', 'Property Damage', 'Environmental', 'Vehicle', 'Fire', 'Utility Strike'] as const;

interface DivisionChartProps {
  data: DivisionIncidentRecord[];
}

export function DivisionChart({ data }: DivisionChartProps) {
  // Shorten division labels for display
  const displayData = data.map((d) => ({
    ...d,
    division: d.division.length > 6 ? d.division.slice(0, 6) + '…' : d.division,
    fullDivision: d.division,
  }));

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Incidents by Division</h3>
      <p className={styles.subtitle}>Grouped by incident type</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={displayData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
          <XAxis
            dataKey="division"
            tick={{ fill: '#888', fontSize: 10 }}
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
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              fontSize: '0.8125rem',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.7rem', paddingTop: '0.5rem' }}
            iconSize={8}
            iconType="square"
          />
          {TYPES.map((type) => (
            <Bar
              key={type}
              dataKey={type}
              name={type}
              fill={COLORS[type]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

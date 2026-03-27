import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { TrirDataPoint } from '../../utils';
import { TRIR_BENCHMARK } from '../../types';
import styles from './TrirTrendChart.module.css';

interface TrirTrendChartProps {
  data: TrirDataPoint[];
  benchmark?: number;
}

export function TrirTrendChart({ data, benchmark = TRIR_BENCHMARK }: TrirTrendChartProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>TRIR Trend</h3>
          <p className={styles.subtitle}>Monthly Total Recordable Incident Rate</p>
        </div>
        <div className={styles.benchmarkLabel}>
          <span className={styles.benchmarkDot} />
          Benchmark {benchmark}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
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
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              fontSize: '0.8125rem',
            }}
            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }}
            iconSize={10}
          />
          <ReferenceLine
            y={benchmark}
            stroke="#f59e0b"
            strokeDasharray="6 3"
            label={{ value: `Benchmark ${benchmark}`, fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }}
          />
          <Line
            type="monotone"
            dataKey="trir"
            name="TRIR"
            stroke="#c8a45a"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#c8a45a' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

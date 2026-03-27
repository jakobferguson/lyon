import type { LeadingIndicator } from '../../utils';
import styles from './LeadingIndicators.module.css';

interface LeadingIndicatorsProps {
  indicators: LeadingIndicator[];
}

function IndicatorCard({ indicator }: { indicator: LeadingIndicator }) {
  const pct = indicator.unit === '%'
    ? indicator.actual
    : Math.min(100, Math.round((indicator.actual / indicator.target) * 100));

  return (
    <div className={`${styles.card} ${indicator.onTrack ? styles.onTrack : styles.behind}`}>
      <div className={styles.topRow}>
        <span className={styles.label}>{indicator.label}</span>
        <span className={`${styles.pill} ${indicator.onTrack ? styles.pillGood : styles.pillBad}`}>
          {indicator.onTrack ? 'On Track' : 'Behind'}
        </span>
      </div>

      <div className={styles.values}>
        <span className={styles.actual}>
          {indicator.actual}{indicator.unit === '%' ? '%' : ''}
        </span>
        <span className={styles.target}>
          target: {indicator.target}{indicator.unit === '%' ? '%' : ''}
        </span>
      </div>

      <div className={styles.barTrack} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`${styles.barFill} ${indicator.onTrack ? styles.barGood : styles.barBad}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <p className={styles.description}>{indicator.description}</p>
    </div>
  );
}

export function LeadingIndicators({ indicators }: LeadingIndicatorsProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Leading Indicators</h2>
      <div className={styles.grid}>
        {indicators.map((ind) => (
          <IndicatorCard key={ind.label} indicator={ind} />
        ))}
      </div>
    </div>
  );
}

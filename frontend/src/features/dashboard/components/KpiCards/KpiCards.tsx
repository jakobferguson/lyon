import { Link } from 'react-router-dom';
import type { KpiData, TrendDirection } from '../../utils';
import { getTrend, formatRate } from '../../utils';
import styles from './KpiCards.module.css';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: TrendDirection;
  trendGoodDirection?: 'up' | 'down'; // which direction is good (green)
  gated?: boolean;
  gateLabel?: string;
  href?: string;
  variant?: 'default' | 'warning' | 'danger';
}

function TrendArrow({ direction, goodDirection }: { direction: TrendDirection; goodDirection: 'up' | 'down' }) {
  if (direction === 'flat') return <span className={styles.trendFlat}>→ unchanged</span>;
  const isGood = direction === goodDirection;
  return (
    <span className={`${styles.trend} ${isGood ? styles.trendGood : styles.trendBad}`}>
      {direction === 'up' ? '↑' : '↓'} vs. prior period
    </span>
  );
}

function KpiCard({ label, value, sub, trend, trendGoodDirection = 'up', gated, gateLabel, href, variant = 'default' }: KpiCardProps) {
  const inner = (
    <div className={`${styles.card} ${styles[variant]}`}>
      <span className={styles.label}>{label}</span>
      {gated ? (
        <span className={styles.gated}>{gateLabel ?? 'Hours required'}</span>
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      {!gated && sub && <span className={styles.sub}>{sub}</span>}
      {!gated && trend && <TrendArrow direction={trend} goodDirection={trendGoodDirection} />}
    </div>
  );

  if (href) {
    return <Link to={href} className={styles.cardLink}>{inner}</Link>;
  }
  return inner;
}

interface KpiCardsProps {
  data: KpiData;
}

export function KpiCards({ data }: KpiCardsProps) {
  const trirTrend     = getTrend(data.trir, data.trirPrev);
  const dartTrend     = getTrend(data.dartRate, data.dartRatePrev);

  return (
    <div className={styles.grid}>
      <KpiCard
        label="TRIR"
        value={data.trir !== null ? formatRate(data.trir) : '—'}
        sub="Total Recordable Incident Rate"
        trend={trirTrend}
        trendGoodDirection="down"
        gated={!data.hoursAvailable}
        gateLabel="Enter hours to calculate"
        variant={data.trir !== null && data.trir > 3.0 ? 'danger' : data.trir !== null && data.trir > 2.0 ? 'warning' : 'default'}
      />
      <KpiCard
        label="DART Rate"
        value={data.dartRate !== null ? formatRate(data.dartRate) : '—'}
        sub="Days Away, Restricted, or Transfer"
        trend={dartTrend}
        trendGoodDirection="down"
        gated={!data.hoursAvailable}
        gateLabel="Enter hours to calculate"
        variant={data.dartRate !== null && data.dartRate > 2.0 ? 'danger' : 'default'}
      />
      <KpiCard
        label="Near Miss Ratio"
        value={data.nearMissRatio !== null ? `${data.nearMissRatio}:1` : '—'}
        sub="Near misses per recordable incident"
        variant="default"
      />
      <KpiCard
        label="Open Investigations"
        value={String(data.openInvestigations)}
        href="/app/investigations"
        variant={data.openInvestigations > 5 ? 'warning' : 'default'}
      />
      <KpiCard
        label="Open CAPAs"
        value={String(data.openCapas)}
        href="/app/capas"
        variant={data.openCapas > 5 ? 'warning' : 'default'}
      />
      <KpiCard
        label="Lost Work Days YTD"
        value={String(data.lostWorkDaysYtd)}
        sub="calendar year to date"
        variant={data.lostWorkDaysYtd > 30 ? 'danger' : 'default'}
      />
    </div>
  );
}

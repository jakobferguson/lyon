import { cn } from '../../../utils/cn';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  showLabel?: boolean;
}

function getVariant(value: number): 'low' | 'mid' | 'high' {
  if (value < 50) return 'low';
  if (value < 80) return 'mid';
  return 'high';
}

export function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const variant = getVariant(clamped);

  return (
    <div className={cn(styles.wrapper, className)}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Form completion: ${clamped}%`}
      >
        <div
          className={cn(styles.fill, styles[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn(styles.label, styles[`label_${variant}`])}>
          {clamped}%
        </span>
      )}
    </div>
  );
}

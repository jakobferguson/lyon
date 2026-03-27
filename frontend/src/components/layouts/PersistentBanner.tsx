import { useState } from 'react';
import styles from './PersistentBanner.module.css';

interface PersistentBannerProps {
  message: string;
}

export function PersistentBanner({ message }: PersistentBannerProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className={`${styles.banner} ${styles.collapsedBar}`} role="status">
        <button
          className={styles.expandBtn}
          onClick={() => setCollapsed(false)}
          aria-label="Expand escalation banner"
        >
          ⚠ {message.slice(0, 60)}{message.length > 60 ? '…' : ''} — click to expand
        </button>
      </div>
    );
  }

  return (
    <div className={styles.banner} role="alert" aria-live="assertive">
      <span className={styles.icon} aria-hidden="true">⚠</span>
      <p className={styles.message}>{message}</p>
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed(true)}
        aria-label="Collapse banner for this session"
      >
        Collapse
      </button>
    </div>
  );
}

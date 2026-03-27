import styles from './ComingSoon.module.css';

interface ComingSoonProps {
  name: string;
}

export function ComingSoon({ name }: ComingSoonProps) {
  return (
    <div className={styles.wrapper} role="main">
      <span className={styles.icon} aria-hidden="true">🚧</span>
      <h1 className={styles.heading}>{name}</h1>
      <p className={styles.sub}>This feature is coming in a future phase.</p>
    </div>
  );
}

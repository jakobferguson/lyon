import styles from './AccessDenied.module.css';

export function AccessDenied() {
  return (
    <div className={styles.wrapper} role="alert">
      <span className={styles.icon} aria-hidden="true">🚫</span>
      <h1 className={styles.heading}>Access Denied</h1>
      <p className={styles.sub}>You do not have permission to view this page.</p>
    </div>
  );
}

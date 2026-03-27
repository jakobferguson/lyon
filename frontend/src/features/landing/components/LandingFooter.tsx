import styles from './LandingFooter.module.css';
import { APP_NAME, APP_SUBTITLE } from '../../../config/app';

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logoName}>Herzog</span>
          <span className={styles.appName}>{APP_NAME}</span>
          <p className={styles.subtitle}>{APP_SUBTITLE}</p>
        </div>

        <p className={styles.copy}>
          &copy; {year} Herzog. All rights reserved. Internal use only.
        </p>
      </div>
    </footer>
  );
}

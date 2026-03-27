import styles from './LandingHeader.module.css';

export function LandingHeader() {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.logoName}>Herzog</span>
          <span className={styles.logoDivider} aria-hidden="true" />
          <span className={styles.logoApp}>Lyon</span>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#divisions" className={styles.navLink}>Divisions</a>
          <a href="#sign-in" className={styles.navLinkCta}>Sign In</a>
        </nav>
      </div>
    </header>
  );
}

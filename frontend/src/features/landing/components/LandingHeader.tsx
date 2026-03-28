import { useNavigate } from 'react-router-dom';
import { msalInstance } from '../../../lib/msal';
import styles from './LandingHeader.module.css';

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true';

export function LandingHeader() {
  const navigate = useNavigate();

  function handleSignIn() {
    if (DEV_AUTH) {
      navigate('/dev-login');
    } else {
      msalInstance.loginRedirect();
    }
  }

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
          <button onClick={handleSignIn} className={styles.navLinkCta}>Sign In</button>
        </nav>
      </div>
    </header>
  );
}

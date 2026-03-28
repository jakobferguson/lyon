import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import type { Role, Division } from '../../../types';
import styles from './DevLoginRoute.module.css';

// Each "account" maps to a role + display identity
const ACCOUNTS: {
  role: Role;
  name: string;
  email: string;
  division: Division | '';
  initials: string;
  color: string;
}[] = [
  { role: 'field_reporter',     name: 'Alex Rivera',       email: 'a.rivera@herzog.com',      division: 'HCC',   initials: 'AR', color: '#0078d4' },
  { role: 'safety_coordinator', name: 'Maria Santos',      email: 'm.santos@herzog.com',      division: 'HCC',   initials: 'MS', color: '#107c41' },
  { role: 'safety_manager',     name: 'Trevor Griffith',   email: 't.griffith@herzog.com',    division: '',      initials: 'TG', color: '#8764b8' },
  { role: 'project_manager',    name: 'James Okafor',      email: 'j.okafor@herzog.com',      division: 'HRSI',  initials: 'JO', color: '#d83b01' },
  { role: 'division_manager',   name: 'Lin Chen',          email: 'l.chen@herzog.com',        division: 'HTI',   initials: 'LC', color: '#038387' },
  { role: 'executive',          name: 'Sandra Kowalski',   email: 's.kowalski@herzog.com',    division: '',      initials: 'SK', color: '#ca5010' },
  { role: 'admin',              name: 'Dev Admin',         email: 'admin@herzog.com',         division: '',      initials: 'DA', color: '#57606a' },
];

const ROLE_LABELS: Record<Role, string> = {
  field_reporter:     'Field Reporter',
  safety_coordinator: 'Safety Coordinator',
  safety_manager:     'Safety Manager',
  project_manager:    'Project Manager',
  division_manager:   'Division Manager',
  executive:          'Executive',
  admin:              'Administrator',
};

export function DevLoginRoute() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<'pick' | 'password'>('pick');
  const [selectedIndex, setSelectedIndex] = useState(2); // Safety Manager default
  const [password, setPassword] = useState('');

  const account = ACCOUNTS[selectedIndex];

  function handlePickNext(e: FormEvent) {
    e.preventDefault();
    setStep('password');
  }

  function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setUser(
      { id: `dev-${account.role}`, name: account.name, email: account.email },
      account.role,
      account.division === '' ? null : account.division,
    );
    navigate('/app/dashboard');
  }

  function handleBack() {
    setStep('pick');
    setPassword('');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Microsoft logo */}
        <div className={styles.msLogo} aria-label="Microsoft">
          <svg width="21" height="21" viewBox="0 0 21 21" aria-hidden="true">
            <rect x="0" y="0" width="10" height="10" fill="#f25022" />
            <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
            <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
            <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
          </svg>
        </div>

        {step === 'pick' ? (
          <form onSubmit={handlePickNext} noValidate>
            <h1 className={styles.heading}>Sign in</h1>
            <p className={styles.subheading}>to continue to <strong>Lyon</strong> — Herzog Safety Platform</p>

            <div className={styles.accountList}>
              {ACCOUNTS.map((acct, i) => (
                <label
                  key={acct.role}
                  className={`${styles.accountRow} ${selectedIndex === i ? styles.accountRowSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="account"
                    className={styles.radioHidden}
                    checked={selectedIndex === i}
                    onChange={() => setSelectedIndex(i)}
                  />
                  <span
                    className={styles.avatar}
                    style={{ background: acct.color }}
                    aria-hidden="true"
                  >
                    {acct.initials}
                  </span>
                  <span className={styles.accountInfo}>
                    <span className={styles.accountName}>{acct.name}</span>
                    <span className={styles.accountEmail}>{acct.email}</span>
                  </span>
                  <span className={styles.accountRole}>{ROLE_LABELS[acct.role]}</span>
                </label>
              ))}
            </div>

            <button type="submit" className={styles.nextBtn}>Next</button>

            <div className={styles.devBadge}>DEV ENVIRONMENT — Azure AD bypassed</div>
          </form>
        ) : (
          <form onSubmit={handleSignIn} noValidate>
            {/* Signed-in-as header */}
            <div className={styles.selectedAccount}>
              <span
                className={styles.avatarSm}
                style={{ background: account.color }}
                aria-hidden="true"
              >
                {account.initials}
              </span>
              <div className={styles.selectedAccountText}>
                <span className={styles.accountName}>{account.name}</span>
                <button type="button" className={styles.switchLink} onClick={handleBack}>
                  ← Use a different account
                </button>
              </div>
            </div>

            <h1 className={styles.heading}>Enter password</h1>
            <p className={styles.subheading}>{account.email}</p>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="ms-password">Password</label>
              <input
                id="ms-password"
                type="password"
                className={styles.msInput}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                autoComplete="current-password"
              />
            </div>

            <a href="#" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>
              Forgot my password
            </a>

            <button type="submit" className={styles.nextBtn}>Sign in</button>

            <div className={styles.devBadge}>DEV ENVIRONMENT — Azure AD bypassed</div>
          </form>
        )}
      </div>

      <p className={styles.footer}>
        © {new Date().getFullYear()} Herzog — Internal Use Only
      </p>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { Button } from '../../../components/ui';
import type { Role, Division } from '../../../types';
import styles from './DevLoginRoute.module.css';

const ROLES: { value: Role; label: string }[] = [
  { value: 'field_reporter',      label: 'Field Reporter' },
  { value: 'safety_coordinator',  label: 'Safety Coordinator' },
  { value: 'safety_manager',      label: 'Safety Manager' },
  { value: 'project_manager',     label: 'Project Manager' },
  { value: 'division_manager',    label: 'Division Manager' },
  { value: 'executive',           label: 'Executive' },
  { value: 'admin',               label: 'Admin' },
];

const DIVISIONS: { value: Division | ''; label: string }[] = [
  { value: '',              label: 'No Division (Company-Wide)' },
  { value: 'HCC',           label: 'HCC — Herzog Contracting Corp.' },
  { value: 'HRSI',          label: 'HRSI — Herzog Railway Services, Inc.' },
  { value: 'HSI',           label: 'HSI — Herzog Services, Inc.' },
  { value: 'HTI',           label: 'HTI — Herzog Transit Inc.' },
  { value: 'HTSI',          label: 'HTSI — Herzog Technology Solutions' },
  { value: 'Herzog Energy', label: 'Herzog Energy' },
  { value: 'Green Group',   label: 'Green Group' },
];

export function DevLoginRoute() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [role, setRole] = useState<Role>('admin');
  const [division, setDivision] = useState<Division | ''>('');
  const [name, setName] = useState('Dev User');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUser(
      { id: 'dev-user-001', name, email: 'dev@herzog.com' },
      role,
      division === '' ? null : division,
    );
    navigate('/app/dashboard');
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoBar}>
          <span className={styles.logoName}>Herzog</span>
          <span className={styles.logoDivider} aria-hidden="true" />
          <span className={styles.logoApp}>Lyon · Dev Login</span>
        </div>

        <p className={styles.notice}>
          Development mode — Azure AD bypassed. Pick a role to sign in.
        </p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.label} htmlFor="dev-name">
            Display Name
          </label>
          <input
            id="dev-name"
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className={styles.label} htmlFor="dev-role">
            Role
          </label>
          <select
            id="dev-role"
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <label className={styles.label} htmlFor="dev-division">
            Division
          </label>
          <select
            id="dev-division"
            className={styles.select}
            value={division}
            onChange={(e) => setDivision(e.target.value as Division | '')}
          >
            {DIVISIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <Button type="submit" variant="accent" size="lg" className={styles.submitBtn}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}

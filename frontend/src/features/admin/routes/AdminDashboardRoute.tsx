import { Link } from 'react-router-dom';
import styles from './AdminDashboardRoute.module.css';

const SECTIONS = [
  { to: '/app/admin/railroads', icon: '🚂', title: 'Railroads',    description: 'Manage railroad clients and notification deadline rules per incident type.' },
  { to: '/app/admin/factors',   icon: '🔬', title: 'Factor Types', description: 'Maintain the library of contributing factor categories and labels.' },
  { to: '/app/admin/shifts',    icon: '🕐', title: 'Shift Windows', description: 'Define shift windows (name, start time, end time) used during incident reporting.' },
  { to: '/app/admin/hours',     icon: '⏱', title: 'Hours Worked',  description: 'Enter and manage labor hours worked by division and month for TRIR/DART calculation.' },
  { to: '/app/admin/geofences', icon: '📍', title: 'Geofences',    description: 'Configure radius-based geofence zones tied to railroad yards and worksites.' },
  { to: '/app/admin/users',     icon: '👥', title: 'Users',        description: 'Manage user accounts, assign roles and divisions.' },
  { to: '/app/admin/audit-log', icon: '📋', title: 'Audit Log',    description: 'View the immutable append-only log of all system changes and actions.' },
];

export function AdminDashboardRoute() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Administration</h1>
        <p className={styles.subtitle}>Configure system settings, manage reference data, and maintain users.</p>
      </div>

      <div className={styles.grid}>
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className={styles.card}>
            <span className={styles.cardIcon}>{s.icon}</span>
            <h2 className={styles.cardTitle}>{s.title}</h2>
            <p className={styles.cardDesc}>{s.description}</p>
            <span className={styles.cardArrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

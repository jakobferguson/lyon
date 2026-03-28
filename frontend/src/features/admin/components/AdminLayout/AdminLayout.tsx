import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/app/admin',            label: '🏠 Overview',      end: true },
  { to: '/app/admin/railroads',  label: '🚂 Railroads'            },
  { to: '/app/admin/factors',    label: '🔬 Factor Types'         },
  { to: '/app/admin/shifts',     label: '🕐 Shift Windows'        },
  { to: '/app/admin/hours',      label: '⏱ Hours Worked'         },
  { to: '/app/admin/geofences',  label: '📍 Geofences'           },
  { to: '/app/admin/users',      label: '👥 Users'               },
  { to: '/app/admin/audit-log',  label: '📋 Audit Log'           },
];

export function AdminLayout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarIcon}>⚙</span>
          <span className={styles.sidebarTitle}>Administration</span>
        </div>
        <nav className={styles.nav} aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { usePermission } from '../../../hooks/usePermission';
import { Tooltip } from '../../ui';
import styles from './Sidebar.module.css';
import { APP_NAME } from '../../../config/app';

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
  requiredRole?: Parameters<typeof usePermission>[0];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard',      label: 'Dashboard',       icon: '📊' },
  { to: '/app/incidents',      label: 'Incidents',       icon: '📋' },
  { to: '/app/investigations', label: 'Investigations',  icon: '🔍', requiredRole: 'safety_coordinator' },
  { to: '/app/capas',          label: 'CAPAs',           icon: '✅', requiredRole: 'safety_coordinator' },
  { to: '/app/admin',          label: 'Admin',           icon: '⚙️', requiredRole: 'safety_manager' },
];

export function Sidebar({ collapsed }: SidebarProps) {
  const canSeeCoordinator = usePermission('safety_coordinator');
  const canSeeManager     = usePermission('safety_manager');

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.requiredRole) return true;
    if (item.requiredRole === 'safety_coordinator') return canSeeCoordinator;
    if (item.requiredRole === 'safety_manager')     return canSeeManager;
    return true;
  });

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={styles.logoBlock} aria-hidden={collapsed}>
        <span className={styles.logoName}>Herzog</span>
        {!collapsed && <span className={styles.logoApp}>{APP_NAME}</span>}
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <ul role="list">
          {visibleItems.map((item) => (
            <li key={item.to}>
              {collapsed ? (
                <Tooltip content={item.label} side="right">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                    aria-label={item.label}
                  >
                    <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                  </NavLink>
                </Tooltip>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Version */}
      {!collapsed && (
        <div className={styles.version} aria-label="Application version">
          v0.1.0
        </div>
      )}
    </aside>
  );
}

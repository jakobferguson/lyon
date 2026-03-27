import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { msalInstance } from '../../../lib/msal';
import {
  Avatar,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../ui';
import styles from './TopBar.module.css';

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true';

const ROLE_LABELS: Record<string, string> = {
  field_reporter:     'Field Reporter',
  safety_coordinator: 'Safety Coordinator',
  safety_manager:     'Safety Manager',
  project_manager:    'Project Manager',
  division_manager:   'Division Manager',
  executive:          'Executive',
  admin:              'Admin',
};

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const { user, role, clearUser } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    clearUser();
    if (!DEV_AUTH) {
      await msalInstance.logoutRedirect({ postLogoutRedirectUri: '/' });
    } else {
      navigate('/');
    }
  }

  return (
    <header className={styles.topbar} role="banner">
      {/* Skip nav */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      <div className={styles.left}>
        <button
          className={styles.hamburger}
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
        >
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
        </button>
      </div>

      <div className={styles.right}>
        {/* Notification bell — wired in Phase 6 */}
        <button className={styles.iconBtn} aria-label="Notifications (0 unread)">
          <span aria-hidden="true">🔔</span>
        </button>

        <span className={styles.divider} aria-hidden="true" />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={styles.userBtn} aria-label="User menu">
                <Avatar name={user.name} size="sm" />
                <span className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRole}>{role ? ROLE_LABELS[role] : ''}</span>
                </span>
                <span className={styles.chevron} aria-hidden="true">▾</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleSignOut} destructive>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

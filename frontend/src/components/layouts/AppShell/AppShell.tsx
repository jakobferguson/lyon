import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PersistentBanner } from '../PersistentBanner';
import { useNotificationStore } from '../../../features/notifications/stores/notificationStore';
import styles from './AppShell.module.css';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const tier3Notifications = notifications.filter((n) => n.tier === 3 && !n.read);

  return (
    <div className={styles.shell}>
      <Sidebar collapsed={collapsed} />

      <div className={styles.main}>
        <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} />

        <div id="persistent-banner-slot">
          {tier3Notifications.map((n) => (
            <PersistentBanner key={n.id} message={n.summary} />
          ))}
        </div>

        <div id="main-content" className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

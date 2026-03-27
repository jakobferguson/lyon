import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import styles from './AppShell.module.css';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar collapsed={collapsed} />

      <div className={styles.main}>
        <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} />

        {/* PersistentBanner slot — wired in Phase 6 */}
        <div id="persistent-banner-slot" />

        <div id="main-content" className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

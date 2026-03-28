import { useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationDrawer } from '../NotificationDrawer/NotificationDrawer';
import styles from './NotificationBell.module.css';

export function NotificationBell() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={styles.bell}
        aria-label={`Notifications (${unreadCount} unread)`}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

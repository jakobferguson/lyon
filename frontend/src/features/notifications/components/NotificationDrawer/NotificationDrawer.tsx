import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationItem } from '../NotificationItem/NotificationItem';
import styles from './NotificationDrawer.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: Props) {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount   = useNotificationStore((s) => s.unreadCount);
  const markAllRead   = useNotificationStore((s) => s.markAllRead);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      {open && <div className={styles.backdrop} aria-hidden onClick={onClose} />}

      <div
        ref={drawerRef}
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Notifications</h2>
          {unreadCount > 0 && (
            <button className={styles.markAll} onClick={markAllRead}>
              Mark all read
            </button>
          )}
          <button className={styles.close} onClick={onClose} aria-label="Close notifications">
            ✕
          </button>
        </div>

        <div className={styles.list}>
          {sorted.length === 0 ? (
            <p className={styles.empty}>No notifications</p>
          ) : (
            sorted.map((n) => (
              <NotificationItem key={n.id} notification={n} onClose={onClose} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

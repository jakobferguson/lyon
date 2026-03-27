import { useNavigate } from 'react-router-dom';
import { type AppNotification, EVENT_ICONS } from '../../types';
import { useNotificationStore } from '../../stores/notificationStore';
import styles from './NotificationItem.module.css';

interface Props {
  notification: AppNotification;
  onClose: () => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationItem({ notification, onClose }: Props) {
  const markRead = useNotificationStore((s) => s.markRead);
  const navigate = useNavigate();

  const handleClick = () => {
    markRead(notification.id);
    onClose();
    navigate(notification.linkTo);
  };

  const icon = EVENT_ICONS[notification.eventType] ?? '🔔';

  return (
    <button
      className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
      onClick={handleClick}
    >
      <span className={styles.icon} aria-hidden>{icon}</span>

      <div className={styles.body}>
        <p className={styles.title}>{notification.title}</p>
        <p className={styles.summary}>{notification.summary}</p>
        <p className={styles.timestamp}>{formatRelativeTime(notification.createdAt)}</p>
      </div>

      {!notification.read && <span className={styles.dot} aria-label="Unread" />}
    </button>
  );
}

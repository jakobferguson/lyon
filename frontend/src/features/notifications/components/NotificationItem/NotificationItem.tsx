import { useNavigate } from 'react-router-dom';
import { EVENT_ICONS } from '../../types';
import type { NotificationDto } from '../../api/notifications';
import { useMarkRead } from '../../api/notifications';
import { formatRelativeTime } from '../../../../utils/dates';
import styles from './NotificationItem.module.css';

interface Props {
  notification: NotificationDto;
  onClose: () => void;
}

export function NotificationItem({ notification, onClose }: Props) {
  const markReadMutation = useMarkRead();
  const navigate = useNavigate();

  const icon = EVENT_ICONS[notification.type as keyof typeof EVENT_ICONS] ?? '🔔';

  // Build a navigation link from entityType/entityId
  const linkTo = notification.entityType && notification.entityId
    ? `/app/${notification.entityType}/${notification.entityId}`
    : '/app';

  const handleClick = () => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    onClose();
    navigate(linkTo);
  };

  return (
    <button
      className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
      onClick={handleClick}
    >
      <span className={styles.icon} aria-hidden>{icon}</span>

      <div className={styles.body}>
        <p className={styles.title}>{notification.title}</p>
        <p className={styles.summary}>{notification.summary}</p>
        <p className={styles.timestamp}>{formatRelativeTime(notification.createdAt)}</p>
      </div>

      {!notification.isRead && <span className={styles.dot} aria-label="Unread" />}
    </button>
  );
}

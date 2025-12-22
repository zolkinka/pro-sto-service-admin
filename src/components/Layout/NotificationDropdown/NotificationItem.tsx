import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import type { NotificationItemProps } from './NotificationDropdown.types';
import './NotificationItem.css';

const formatTime = (dateString: string): string => format(new Date(dateString), 'HH:mm');

const NotificationItem = observer(({ notification, onClick }: NotificationItemProps) => {
  const time = formatTime(notification.createdAt);

  const handleClick = () => {
    onClick(notification.uuid);
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? 'notification-item--read' : 'notification-item--unread'}`}
      onClick={handleClick}
    >
      <div className="notification-item__content">
        <div className="notification-item__row notification-item__row--top">
          <p className="notification-item__title">{notification.title}</p>
          <span className="notification-item__time">{time}</span>
        </div>
        <div className="notification-item__row notification-item__row--bottom">
          {notification.subtitle && (
            <span className="notification-item__subtitle">{notification.subtitle}</span>
          )}
          <p className="notification-item__body">{notification.body}</p>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;

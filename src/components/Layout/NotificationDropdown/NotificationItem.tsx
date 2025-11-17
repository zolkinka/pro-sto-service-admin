import { observer } from 'mobx-react-lite';
import type { NotificationItemProps } from './NotificationDropdown.types';
import './NotificationItem.css';

/**
 * Форматировать дату в формат DD.MM.YY
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

const NotificationItem = observer(({ notification, onClick }: NotificationItemProps) => {
  const date = formatDate(notification.createdAt);

  const handleClick = () => {
    onClick(notification.uuid);
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? 'notification-item--read' : 'notification-item--unread'}`}
      onClick={handleClick}
    >
      <div className="notification-item__content">
        <div className="notification-item__header">
          <p className="notification-item__title">{notification.title}</p>
          {notification.subtitle && (
            <div className="notification-item__license">
              <span className="notification-item__license-plate">
                {notification.subtitle}
              </span>
            </div>
          )}
        </div>
        <p className="notification-item__body">{notification.body}</p>
      </div>
      <p className="notification-item__date">{date}</p>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;

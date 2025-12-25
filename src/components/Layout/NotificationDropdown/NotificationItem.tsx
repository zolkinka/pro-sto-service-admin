import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';
import type { NotificationItemProps } from './NotificationDropdown.types';
import './NotificationItem.css';

const formatTime = (dateString: string): string => format(new Date(dateString), 'HH:mm');

const NotificationItem = observer(({ notification, onClick, onVisible }: NotificationItemProps) => {
  const time = formatTime(notification.createdAt);
  const itemRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver для автоматической пометки как прочитанного
  useEffect(() => {
    if (!onVisible || notification.isRead) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(notification.uuid);
          }
        });
      },
      { threshold: 0.5 } // 50% элемента видимо
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [notification.uuid, notification.isRead, onVisible]);

  const handleClick = () => {
    onClick(notification.uuid);
  };

  return (
    <div
      ref={itemRef}
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

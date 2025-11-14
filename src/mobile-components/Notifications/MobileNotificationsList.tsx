import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { notificationStore } from '../../stores/NotificationStore';
import { MobileNotificationCard } from './MobileNotificationCard';
import './MobileNotificationsList.css';

export const MobileNotificationsList = observer(() => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !notificationStore.isLoading) {
          if (notificationStore.notifications.length < notificationStore.total) {
            notificationStore.loadMore();
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []);

  const { notifications, isLoading } = notificationStore;

  // Первая загрузка - skeleton
  if (isLoading && notifications.length === 0) {
    return (
      <div className="notifications-list">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="notification-skeleton">
            <div className="notification-skeleton__header" />
            <div className="notification-skeleton__body" />
          </div>
        ))}
      </div>
    );
  }

  // Пустое состояние
  if (notifications.length === 0 && !isLoading) {
    return (
      <div className="notifications-empty">
        <p>У вас пока нет уведомлений</p>
      </div>
    );
  }

  return (
    <div className="notifications-list">
      {notifications.map((notification) => (
        <MobileNotificationCard key={notification.uuid} notification={notification} />
      ))}
      
      {/* Маркер для infinite scroll */}
      <div ref={loadMoreRef} className="notifications-list__load-trigger" />
      
      {/* Загрузка следующей страницы */}
      {isLoading && notifications.length > 0 && (
        <div className="notifications-list__spinner">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
});

MobileNotificationsList.displayName = 'MobileNotificationsList';

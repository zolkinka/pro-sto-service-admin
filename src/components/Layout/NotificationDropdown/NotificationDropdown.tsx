import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../../../hooks';
import { useStores } from '../../../hooks/useStores';
import AppButton from '../../ui/AppButton/AppButton';
import NotificationItem from './NotificationItem';
import type { NotificationDropdownProps } from './NotificationDropdown.types';
import './NotificationDropdown.css';

const NotificationDropdown = observer(({ isOpen, onClose }: NotificationDropdownProps) => {
  const { notificationStore } = useStores();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Закрытие при клике вне компонента
  useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () => {
    if (isOpen) {
      onClose();
    }
  });

  // Загрузка уведомлений при открытии
  useEffect(() => {
    if (isOpen) {
      notificationStore.fetchNotifications(true);
    }
  }, [isOpen, notificationStore]);

  // Обработка клика по уведомлению
  const handleNotificationClick = async (uuid: string) => {
    const notification = notificationStore.notifications.find((n) => n.uuid === uuid);
    
    // Помечаем как прочитанное
    if (notification && !notification.isRead) {
      await notificationStore.markAsRead(uuid);
    }

    // Переходим на страницу заказа, если есть UUID
    if (notification?.data && typeof notification.data === 'object') {
      const bookingUuid = (notification.data as Record<string, unknown>).booking_uuid;
      if (bookingUuid && typeof bookingUuid === 'string') {
        onClose();
        navigate(`/orders?booking=${bookingUuid}`);
      }
    }
  };

  // Обработка "Отметить все как прочитанные"
  const handleMarkAllAsRead = async () => {
    await notificationStore.markAllAsRead();
  };

  // Обработка прокрутки для бесконечной загрузки
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && !notificationStore.isLoading) {
      notificationStore.loadMore();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-dropdown__header">
        <h3 className="notification-dropdown__title">Уведомления</h3>
        {notificationStore.notifications.length > 0 && (
          <AppButton
            variant="invisible"
            size="M"
            onClick={handleMarkAllAsRead}
            className="notification-dropdown__mark-all"
          >
            Отметить все как прочитанное
          </AppButton>
        )}
      </div>

      <div className="notification-dropdown__list" onScroll={handleScroll}>
        {notificationStore.isLoading && notificationStore.notifications.length === 0 ? (
          <div className="notification-dropdown__loading">
            <p>Загрузка...</p>
          </div>
        ) : notificationStore.notifications.length === 0 ? (
          <div className="notification-dropdown__empty">
            <p>Нет уведомлений</p>
          </div>
        ) : (
          <>
            {notificationStore.notifications.map((notification) => (
              <NotificationItem
                key={notification.uuid}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
            {notificationStore.isLoading && (
              <div className="notification-dropdown__loading-more">
                <p>Загрузка...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown';

export default NotificationDropdown;

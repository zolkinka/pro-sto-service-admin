import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek } from 'date-fns';
import { useClickOutside } from '../../../hooks';
import { useStores } from '../../../hooks/useStores';
import AppButton from '../../ui/AppButton/AppButton';
import NotificationItem from './NotificationItem';
import type { NotificationDropdownProps } from './NotificationDropdown.types';
import './NotificationDropdown.css';

const NotificationDropdown = observer(({ isOpen, onClose }: NotificationDropdownProps) => {
  const { notificationStore, bookingsStore } = useStores();
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
        try {
          // Загружаем детали бронирования чтобы узнать дату
          await bookingsStore.fetchBookingDetails(bookingUuid);
          const booking = bookingsStore.selectedBooking;
          
          if (booking) {
            // Вычисляем начало недели для даты бронирования
            const bookingDate = new Date(booking.start_time);
            const weekStart = startOfWeek(bookingDate, { weekStartsOn: 1 });
            const dateParam = format(weekStart, 'yyyy-MM-dd');
            
            // Переходим на страницу orders с параметрами date и booking
            onClose();
            navigate(`/orders?date=${dateParam}&booking=${bookingUuid}`);
          } else {
            // Если не удалось загрузить детали, просто переходим с booking параметром
            onClose();
            navigate(`/orders?booking=${bookingUuid}`);
          }
        } catch (error) {
          console.error('Error loading booking details:', error);
          // В случае ошибки просто переходим с booking параметром
          onClose();
          navigate(`/orders?booking=${bookingUuid}`);
        }
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

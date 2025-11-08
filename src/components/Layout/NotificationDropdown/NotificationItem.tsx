import { observer } from 'mobx-react-lite';
import type { NotificationItemProps, NotificationData } from './NotificationDropdown.types';
import './NotificationItem.css';

/**
 * Получить заголовок уведомления в зависимости от типа
 */
const getNotificationTitle = (type: string): string => {
  switch (type) {
    case 'new_booking':
      return 'Новая запись';
    case 'booking_cancelled':
      return 'Отмена записи';
    case 'status_change':
      return 'Мойка завершена';
    default:
      return 'Уведомление';
  }
};

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

/**
 * Парсинг данных из поля data уведомления
 */
const parseNotificationData = (data: Record<string, unknown> | null): NotificationData => {
  if (!data) return {};
  
  return {
    licensePlate: data.license_plate as string | undefined,
    region: data.region as string | undefined,
    bookingUuid: data.booking_uuid as string | undefined,
  };
};

const NotificationItem = observer(({ notification, onClick }: NotificationItemProps) => {
  const title = getNotificationTitle(notification.type);
  const date = formatDate(notification.createdAt);
  const parsedData = parseNotificationData(notification.data as Record<string, unknown> | null);

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
          <p className="notification-item__title">{title}</p>
          {parsedData.licensePlate && (
            <div className="notification-item__license">
              <span className="notification-item__license-plate">
                {parsedData.licensePlate}
              </span>
              {parsedData.region && (
                <>
                  <span className="notification-item__divider" />
                  <span className="notification-item__region">{parsedData.region}</span>
                </>
              )}
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

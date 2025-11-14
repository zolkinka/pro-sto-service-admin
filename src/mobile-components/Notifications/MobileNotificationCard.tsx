import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import classNames from 'classnames';
import type { NotificationResponseDto } from '../../../services/api-client';
import { notificationStore } from '../../stores/NotificationStore';
import './MobileNotificationCard.css';

interface MobileNotificationCardProps {
  notification: NotificationResponseDto;
}

export const MobileNotificationCard = observer(({ notification }: MobileNotificationCardProps) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsRead = useRef(false);

  useEffect(() => {
    // Если уже прочитано, не нужно отслеживать
    if (notification.isRead || hasMarkedAsRead.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Если карточка в зоне видимости (>50% видно)
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            if (!hasMarkedAsRead.current) {
              hasMarkedAsRead.current = true;
              notificationStore.markAsRead(notification.uuid);
            }
          }
        });
      },
      {
        threshold: 0.5, // 50% карточки должно быть видно
        rootMargin: '0px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [notification.uuid, notification.isRead]);

  const handleClick = () => {
    // Переход к связанной сущности
    // Используем bookingUuid из data для навигации
    const bookingUuid = notification.data?.bookingUuid;
    
    if (bookingUuid) {
      navigate(`/orders/${bookingUuid}`);
    }
  };

  // Получаем данные для отображения
  const clientName = String(notification.data?.clientName || '');
  const serviceName = String(notification.data?.serviceName || '');
  
  // Форматируем дату
  const formattedDate = format(parseISO(notification.createdAt), 'dd.MM.yy');

  return (
    <div
      ref={cardRef}
      className={classNames('notification-card', {
        'notification-card_unread': !notification.isRead,
      })}
      onClick={handleClick}
    >
      <div className="notification-card__content">
        <div className="notification-card__header">
          <span className="notification-card__title">{notification.title}</span>
          {(clientName || serviceName) && (
            <div className="notification-card__meta">
              {clientName && <span className="notification-card__client">{clientName}</span>}
              {clientName && serviceName && <span className="notification-card__divider" />}
              {serviceName && <span className="notification-card__service">{serviceName}</span>}
            </div>
          )}
        </div>
        <p className="notification-card__body">{notification.body}</p>
      </div>
      <span className="notification-card__date">{formattedDate}</span>
    </div>
  );
});

MobileNotificationCard.displayName = 'MobileNotificationCard';

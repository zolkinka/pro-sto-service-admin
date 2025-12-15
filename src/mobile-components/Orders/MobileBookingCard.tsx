import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { AdminBookingResponseDto } from '../../../services/api-client';
import './MobileBookingCard.css';

interface MobileBookingCardProps {
  booking: AdminBookingResponseDto;
  onClick: (uuid: string) => void;
  canAddMore?: boolean; // Можно ли добавить еще одно бронирование в этот слот
  onAddMore?: () => void; // Callback для добавления нового бронирования
  isMultiple?: boolean; // Множественное бронирование в слоте (для уменьшения ширины)
}

const getStatusColorClass = (status: string): string => {
  switch (status) {
    case 'pending_confirmation':
      return 'mobile-booking-card_pending';
    case 'confirmed':
      return 'mobile-booking-card_confirmed';
    case 'completed':
      return 'mobile-booking-card_completed';
    case 'cancelled':
      return 'mobile-booking-card_cancelled';
    default:
      return '';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending_confirmation':
      return 'В работе';
    case 'confirmed':
      return 'Подтверждена';
    case 'completed':
      return 'Завершено';
    case 'cancelled':
      return 'Отменена';
    default:
      return status;
  }
};

const getStatusTextColorClass = (status: string): string => {
  switch (status) {
    case 'pending_confirmation':
      return 'mobile-booking-card__status_orange';
    case 'confirmed':
      return 'mobile-booking-card__status_blue';
    case 'completed':
      return 'mobile-booking-card__status_green';
    case 'cancelled':
      return 'mobile-booking-card__status_gray';
    default:
      return '';
  }
};

export const MobileBookingCard: React.FC<MobileBookingCardProps> = ({ booking, onClick, canAddMore = false, onAddMore, isMultiple = false }) => {
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    const deltaTime = Date.now() - touchStart.time;

    // Если движение было больше 10px или дольше 200мс - это скролл, не клик
    if (deltaX > 10 || deltaY > 10 || deltaTime > 200) {
      setTouchStart(null);
      return;
    }

    // Иначе это клик
    onClick(booking.uuid);
    setTouchStart(null);
  };

  const handleAddMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddMore) {
      onAddMore();
    }
  };

  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const timeRange = `${format(startTime, 'HH:mm', { locale: ru })} - ${format(endTime, 'HH:mm', { locale: ru })}`;

  return (
    <div 
      className={`mobile-booking-card ${getStatusColorClass(booking.status)} ${isMultiple ? 'mobile-booking-card_multiple' : ''}`} 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mobile-booking-card__header">
        <div className="mobile-booking-card__service-name">
          {booking.service?.name || 'Услуга'}
        </div>
        <div className={`mobile-booking-card__status ${getStatusTextColorClass(booking.status)}`}>
          {getStatusText(booking.status)}
        </div>
      </div>
      
      <div className="mobile-booking-card__time">
        {timeRange}
      </div>

      {/* Кнопка "+" для добавления дополнительной записи */}
      {canAddMore && onAddMore && (
        <button
          className="mobile-booking-card__add-button"
          onClick={handleAddMoreClick}
          aria-label="Добавить еще одну запись"
          type="button"
        >
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};

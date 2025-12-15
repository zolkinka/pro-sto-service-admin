import React from 'react';
import type { AdminBookingResponseDto } from '../../../../../services/api-client';
import './BookingCard.css';

export interface BookingCardProps {
  booking: AdminBookingResponseDto;
  onClick: () => void;
  style?: React.CSSProperties;
  showPlusButton?: boolean;
  onPlusClick?: () => void;
  moreCount?: number; // количество дополнительных заказов
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Выполнен',
  confirmed: 'Подтверждена',
  pending_confirmation: 'Ожидает',
  cancelled: 'Отменён',
};

const formatTime = (time: string): string => {
  const date = new Date(time);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick, style, showPlusButton, onPlusClick, moreCount }) => {
  const startTime = formatTime(booking.start_time);
  const endTime = formatTime(booking.end_time);
  const statusLabel = STATUS_LABELS[booking.status];
  const fullText = `${booking.service.name}\n${startTime}-${endTime}\n${statusLabel}`;

  const handleClick = () => {
    onClick();
  };

  const handlePlusClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onPlusClick?.();
  };

  // Склонение слова "заказ"
  const getOrderWord = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'заказов';
    }
    if (lastDigit === 1) {
      return 'заказ';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'заказа';
    }
    return 'заказов';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`booking-card booking-card_status_${booking.status}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={style}
      title={fullText}
      aria-label={`Заказ ${booking.service.name} с ${startTime} до ${endTime}, статус: ${statusLabel}`}
    >
      <div className="booking-card__content">
        <p className="booking-card__service">{booking.service.name}</p>
        <p className="booking-card__time">
          {startTime}-{endTime}
        </p>
      </div>
      <p className="booking-card__status">{statusLabel}</p>
      
      {/* Кнопка плюса или счётчик дополнительных заказов */}
      {showPlusButton && !moreCount && onPlusClick && (
        <button
          className="booking-card__plus-button"
          onClick={handlePlusClick}
          aria-label="Добавить заказ"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      
      {/* Счётчик дополнительных заказов */}
      {moreCount && moreCount > 0 && (
        <div className="booking-card__more-count">
          ещё {moreCount} {getOrderWord(moreCount)}
        </div>
      )}
    </div>
  );
};

export default BookingCard;

import React from 'react';
import type { AdminBookingResponseDto } from '../../../../../services/api-client';
import './BookingCard.css';

export interface BookingCardProps {
  booking: AdminBookingResponseDto;
  onClick: () => void;
  style?: React.CSSProperties;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Выполнен',
  confirmed: 'Ожидает',
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

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick, style }) => {
  const startTime = formatTime(booking.start_time);
  const endTime = formatTime(booking.end_time);
  const statusLabel = STATUS_LABELS[booking.status];
  const fullText = `${booking.service.name}\n${startTime}-${endTime}\n${statusLabel}`;

  const handleClick = () => {
    onClick();
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
    </div>
  );
};

export default BookingCard;

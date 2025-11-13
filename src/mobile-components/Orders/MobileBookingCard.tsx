import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { AdminBookingResponseDto } from '../../../services/api-client';
import './MobileBookingCard.css';

interface MobileBookingCardProps {
  booking: AdminBookingResponseDto;
  onClick: (uuid: string) => void;
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

export const MobileBookingCard: React.FC<MobileBookingCardProps> = ({ booking, onClick }) => {
  const handleClick = () => {
    onClick(booking.uuid);
  };

  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const timeRange = `${format(startTime, 'HH:mm', { locale: ru })} - ${format(endTime, 'HH:mm', { locale: ru })}`;

  return (
    <div className={`mobile-booking-card ${getStatusColorClass(booking.status)}`} onClick={handleClick}>
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
    </div>
  );
};

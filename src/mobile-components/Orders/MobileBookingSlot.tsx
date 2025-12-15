import React from 'react';
import { MobileBookingCard } from './MobileBookingCard';
import type { AdminBookingResponseDto } from '../../../services/api-client';
import './MobileBookingSlot.css';

interface MobileBookingSlotProps {
  time: string;
  bookings: AdminBookingResponseDto[];
  onBookingClick: (uuid: string) => void;
  onSlotClick?: () => void;
  isPast?: boolean; // Слот в прошлом времени
  canAddMore?: boolean; // Можно ли добавить еще одно бронирование в этот слот
}

export const MobileBookingSlot: React.FC<MobileBookingSlotProps> = ({
  time,
  bookings,
  onBookingClick,
  onSlotClick,
  isPast = false,
  canAddMore = false,
}) => {
  const hasBookings = bookings.length > 0;
  const isClickable = !hasBookings && onSlotClick && !isPast;
  
  // Обработчик для кнопки "+" с предотвращением всплытия
  const handleAddMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSlotClick) {
      onSlotClick();
    }
  };
  
  return (
    <div className="mobile-booking-slot">
      <div className="mobile-booking-slot__time">
        {time}
      </div>
      
      <div className="mobile-booking-slot__content">
        {hasBookings ? (
          <div className="mobile-booking-slot__bookings">
            {bookings.map((booking) => (
              <MobileBookingCard
                key={booking.uuid}
                booking={booking}
                onClick={onBookingClick}
              />
            ))}
            {/* Кнопка "+" для добавления дополнительной записи */}
            {canAddMore && onSlotClick && (
              <button
                className="mobile-booking-slot__add-button"
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
        ) : (
          <div 
            className={`mobile-booking-slot__empty ${isClickable ? 'mobile-booking-slot__empty_clickable' : ''}`}
            onClick={isClickable ? onSlotClick : undefined}
          >
            {isClickable && (
              <svg className="mobile-booking-slot__empty-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

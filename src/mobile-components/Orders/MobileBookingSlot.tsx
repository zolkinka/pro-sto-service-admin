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
}

export const MobileBookingSlot: React.FC<MobileBookingSlotProps> = ({
  time,
  bookings,
  onBookingClick,
  onSlotClick,
  isPast = false,
}) => {
  const hasBookings = bookings.length > 0;
  const isClickable = !hasBookings && onSlotClick && !isPast;
  
  return (
    <div className="mobile-booking-slot">
      <div className="mobile-booking-slot__time">
        {time}
      </div>
      
      <div className="mobile-booking-slot__content">
        {hasBookings ? (
          bookings.map((booking) => (
            <MobileBookingCard
              key={booking.uuid}
              booking={booking}
              onClick={onBookingClick}
            />
          ))
        ) : (
          <div 
            className={`mobile-booking-slot__empty ${isClickable ? 'mobile-booking-slot__empty_clickable' : ''}`}
            onClick={isClickable ? onSlotClick : undefined}
          />
        )}
      </div>
    </div>
  );
};

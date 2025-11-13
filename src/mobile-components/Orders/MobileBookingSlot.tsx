import React from 'react';
import { MobileBookingCard } from './MobileBookingCard';
import type { AdminBookingResponseDto } from '../../../services/api-client';
import './MobileBookingSlot.css';

interface MobileBookingSlotProps {
  time: string;
  bookings: AdminBookingResponseDto[];
  onBookingClick: (uuid: string) => void;
}

export const MobileBookingSlot: React.FC<MobileBookingSlotProps> = ({
  time,
  bookings,
  onBookingClick,
}) => {
  const hasBookings = bookings.length > 0;
  
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
          </div>
        ) : (
          <div className="mobile-booking-slot__empty" />
        )}
      </div>
    </div>
  );
};

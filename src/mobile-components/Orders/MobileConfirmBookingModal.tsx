import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { MobileButton } from '@/mobile-components';
import { NotificationIcon } from '../../components/ui/icons';
import type { DetailedBookingResponseDto, BookingCarDto } from '../../../services/api-client';
import './MobileConfirmBookingModal.css';

interface CarDtoWithImage extends BookingCarDto {
  generated_image?: string | null;
}

interface MobileConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  booking: DetailedBookingResponseDto | null;
  isCancelling?: boolean;
}

export const MobileConfirmBookingModal: React.FC<MobileConfirmBookingModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  booking,
  isCancelling = false,
}) => {
  if (!isOpen || !booking) return null;

  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const dateStr = format(startTime, 'd MMMM yyyy', { locale: ru });
  const timeRange = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;

  const totalCost = booking.total_cost || 0;

  return (
    <div className="mobile-confirm-booking-modal__overlay" onClick={onClose}>
      <div 
        className="mobile-confirm-booking-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-confirm-booking-modal__banner">
          <NotificationIcon />
          <span>Новая запись</span>
        </div>

        <div className="mobile-confirm-booking-modal__content">
          {booking.car && 
           'generated_image' in booking.car && 
           (booking.car as CarDtoWithImage).generated_image && 
           (booking.car as CarDtoWithImage).generated_image!.trim() !== '' && (
            <div className="mobile-confirm-booking-modal__car-image">
              <img 
                src={(booking.car as CarDtoWithImage).generated_image!} 
                alt={`${booking.car.make} ${booking.car.model}`}
                className="mobile-confirm-booking-modal__image"
              />
            </div>
          )}

          <div className="mobile-confirm-booking-modal__section">
            <div className="mobile-confirm-booking-modal__car">
              {booking.car?.make} {booking.car?.model}
            </div>
            <div className="mobile-confirm-booking-modal__license-plate">
              {String(booking.car?.license_plate || '')}
            </div>
          </div>

          <div className="mobile-confirm-booking-modal__section">
            <div className="mobile-confirm-booking-modal__info">
              <span className="mobile-confirm-booking-modal__label">Дата:</span>
              <span className="mobile-confirm-booking-modal__value">{dateStr}</span>
            </div>
            <div className="mobile-confirm-booking-modal__info">
              <span className="mobile-confirm-booking-modal__label">Время:</span>
              <span className="mobile-confirm-booking-modal__value">{timeRange}</span>
            </div>
          </div>

          <div className="mobile-confirm-booking-modal__section">
            <div className="mobile-confirm-booking-modal__services-title">Услуги</div>
            
            {booking.service && (
              <div className="mobile-confirm-booking-modal__service">
                <span>{booking.service.name}</span>
                <span>{booking.service.price} ₽</span>
              </div>
            )}

            {booking.additionalServices && booking.additionalServices.length > 0 && (
              <>
                {booking.additionalServices.map((service, index) => (
                  <div key={index} className="mobile-confirm-booking-modal__service">
                    <span>{service.name}</span>
                    <span>{service.price} ₽</span>
                  </div>
                ))}
              </>
            )}

            <div className="mobile-confirm-booking-modal__total">
              <span>Итого:</span>
              <span>{totalCost} ₽</span>
            </div>
          </div>
        </div>

        <div className="mobile-confirm-booking-modal__actions">
          <MobileButton 
            variant="primary"
            onClick={onClose}
            fullWidth
          >
            Подтвердить
          </MobileButton>
          
          <button
            className="mobile-confirm-booking-modal__cancel-button"
            onClick={onCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Отменяем...' : 'Отменить запись'}
          </button>
        </div>
      </div>
    </div>
  );
};

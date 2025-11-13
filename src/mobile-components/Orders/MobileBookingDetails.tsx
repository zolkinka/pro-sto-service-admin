import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStores } from '@/hooks';
import { MobileButton } from '@/mobile-components';
import { MobileCancelBookingModal } from '@/mobile-components/Orders/MobileCancelBookingModal';
import type { BookingCarDto } from '../../../services/api-client';
import './MobileBookingDetails.css';

interface CarDtoWithImage extends BookingCarDto {
  generated_image?: string | null;
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending_confirmation':
      return 'Ожидает подтверждения';
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

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'pending_confirmation':
      return 'mobile-booking-details__status_pending';
    case 'confirmed':
      return 'mobile-booking-details__status_confirmed';
    case 'completed':
      return 'mobile-booking-details__status_completed';
    case 'cancelled':
      return 'mobile-booking-details__status_cancelled';
    default:
      return '';
  }
};

export const MobileBookingDetails = observer(() => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { bookingsStore } = useStores();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (uuid) {
      bookingsStore.fetchBookingDetails(uuid);
    }

    return () => {
      bookingsStore.clearSelectedBooking();
    };
  }, [uuid, bookingsStore]);

  const handleBack = () => {
    navigate('/orders');
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!uuid) return;

    setIsCancelling(true);
    const success = await bookingsStore.updateBookingStatus(uuid, 'cancelled');
    setIsCancelling(false);

    if (success) {
      setShowCancelModal(false);
      // Возвращаемся на страницу заказов после успешной отмены
      navigate('/orders');
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  if (bookingsStore.isLoadingDetails) {
    return (
      <div className="mobile-booking-details">
        <div className="mobile-booking-details__loading">
          Загрузка...
        </div>
      </div>
    );
  }

  if (!bookingsStore.selectedBooking) {
    return (
      <div className="mobile-booking-details">
        <div className="mobile-booking-details__error">
          Заказ не найден
        </div>
      </div>
    );
  }

  const booking = bookingsStore.selectedBooking;
  const canCancel = booking.status === 'pending_confirmation' || booking.status === 'confirmed';

  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const dateStr = format(startTime, 'd MMMM yyyy', { locale: ru });
  const timeRange = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;

  // Вычисляем общую стоимость
  const totalCost = booking.total_cost || 0;

  return (
    <div className="mobile-booking-details">
      <div className="mobile-booking-details__header">
        <button 
          className="mobile-booking-details__back"
          onClick={handleBack}
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </button>
        <div className={`mobile-booking-details__header-status ${getStatusClass(booking.status)}`}>
          {getStatusLabel(booking.status)}
        </div>
      </div>

      <div className="mobile-booking-details__content">
        {booking.car && 'generated_image' in booking.car && (booking.car as CarDtoWithImage).generated_image && (
          <div className="mobile-booking-details__car-image">
            <img 
              src={(booking.car as CarDtoWithImage).generated_image!} 
              alt={`${booking.car.make} ${booking.car.model}`}
              className="mobile-booking-details__image"
            />
          </div>
        )}

        <div className="mobile-booking-details__section">
          <h2 className="mobile-booking-details__car-name">
            {booking.car?.make} {booking.car?.model}
          </h2>
          <div className="mobile-booking-details__license-plate">
            {String(booking.car?.license_plate || '')}
          </div>
        </div>

        <div className="mobile-booking-details__section">
          <div className="mobile-booking-details__info-row">
            <span className="mobile-booking-details__label">Дата</span>
            <span className="mobile-booking-details__value">{dateStr}</span>
          </div>
          <div className="mobile-booking-details__info-row">
            <span className="mobile-booking-details__label">Время</span>
            <span className="mobile-booking-details__value">{timeRange}</span>
          </div>
        </div>

        <div className="mobile-booking-details__section">
          <h3 className="mobile-booking-details__section-title">Услуги</h3>
          
          {booking.service && (
            <div className="mobile-booking-details__service-item">
              <div className="mobile-booking-details__service-info">
                <div className="mobile-booking-details__service-name">
                  {booking.service.name}
                </div>
                <div className="mobile-booking-details__service-duration">
                  {booking.service.duration_minutes} мин
                </div>
              </div>
              <div className="mobile-booking-details__service-price">
                {booking.service.price} ₽
              </div>
            </div>
          )}

          {booking.additionalServices && booking.additionalServices.length > 0 && (
            <>
              {booking.additionalServices.map((service, index) => (
                <div key={index} className="mobile-booking-details__service-item">
                  <div className="mobile-booking-details__service-info">
                    <div className="mobile-booking-details__service-name">
                      {service.name}
                    </div>
                    <div className="mobile-booking-details__service-duration">
                      {service.duration_minutes} мин
                    </div>
                  </div>
                  <div className="mobile-booking-details__service-price">
                    {service.price} ₽
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="mobile-booking-details__total">
            <span className="mobile-booking-details__total-label">Итого:</span>
            <span className="mobile-booking-details__total-value">{totalCost} ₽</span>
          </div>
        </div>

        {canCancel && (
          <div className="mobile-booking-details__actions">
            <MobileButton 
              variant="primary"
              onClick={handleCancelClick}
              fullWidth
            >
              Отменить запись
            </MobileButton>
          </div>
        )}
      </div>

      <MobileCancelBookingModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
});

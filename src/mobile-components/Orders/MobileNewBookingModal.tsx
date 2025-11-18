import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStores } from '@/hooks';
import { NotificationIcon } from '@/components/ui/icons';
import './MobileNewBookingModal.css';

interface MobileNewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingUuid: string;
  onConfirm: () => void;
  onCancel: () => void;
  currentPendingIndex?: number;
  totalPendingCount?: number;
}

export const MobileNewBookingModal = observer(({
  isOpen,
  onClose,
  bookingUuid,
  onConfirm,
  onCancel,
  currentPendingIndex,
  totalPendingCount,
}: MobileNewBookingModalProps) => {
  const { bookingsStore } = useStores();

  useEffect(() => {
    if (isOpen && bookingUuid) {
      bookingsStore.fetchBookingDetails(bookingUuid);
    }
  }, [isOpen, bookingUuid, bookingsStore]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const booking = bookingsStore.selectedBooking;

  if (bookingsStore.isLoadingDetails) {
    return (
      <div className="mobile-new-booking-modal">
        <div className="mobile-new-booking-modal__backdrop" onClick={onClose} />
        <div className="mobile-new-booking-modal__container">
          <div className="mobile-new-booking-modal__content">
            <div className="mobile-new-booking-modal__skeleton-notification" />
            <div className="mobile-new-booking-modal__skeleton-car" />
            <div className="mobile-new-booking-modal__skeleton-service" />
            <div className="mobile-new-booking-modal__skeleton-comment" />
            <div className="mobile-new-booking-modal__skeleton-button" />
            <div className="mobile-new-booking-modal__skeleton-button" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  // Форматирование даты и времени
  let formattedDate = '';
  let formattedTime = '';
  
  try {
    const startDate = parseISO(booking.start_time);
    const endDate = parseISO(booking.end_time);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      formattedDate = 'Неверная дата';
      formattedTime = 'Неверное время';
    } else {
      formattedDate = format(startDate, 'd MMMM', { locale: ru });
      formattedTime = `${format(startDate, 'HH:mm')}-${format(endDate, 'HH:mm')}`;
    }
  } catch (error) {
    console.error('Error formatting dates:', error);
    formattedDate = 'Ошибка форматирования';
    formattedTime = 'Ошибка форматирования';
  }

  // Форматирование госномера
  const licensePlateData = booking.car.license_plate;
  let licensePlateNumber = 'Не указан';
  let licensePlateRegion: string | null = null;

  if (typeof licensePlateData === 'string') {
    licensePlateNumber = licensePlateData || 'Не указан';
  } else if (licensePlateData && typeof licensePlateData === 'object') {
    const plate = licensePlateData as { number?: string; region?: string };
    licensePlateNumber = plate.number || 'Не указан';
    licensePlateRegion = plate.region || null;
  }

  // Форматирование длительности в минутах
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} ч ${remainingMinutes} мин` : `${hours} ч`;
  };

  // Получаем комментарий
  const clientComment = typeof booking.client_comment === 'string' ? booking.client_comment : null;

  // Подсчет итоговой стоимости
  const totalPrice = booking.service.price + 
    (booking.additionalServices?.reduce((sum, service) => sum + service.price, 0) || 0);

  return (
    <div className="mobile-new-booking-modal">
      <div className="mobile-new-booking-modal__backdrop" onClick={onClose} />
      
      <div className="mobile-new-booking-modal__container">
        <div className="mobile-new-booking-modal__content">
          {/* Notification Header */}
          <div className="mobile-new-booking-modal__notification">
            <NotificationIcon />
            <span>Новая запись</span>
            {totalPendingCount !== undefined && currentPendingIndex !== undefined && totalPendingCount > 1 && (
              <span className="mobile-new-booking-modal__counter">
                {currentPendingIndex + 1} из {totalPendingCount}
              </span>
            )}
          </div>

          {/* Car Details */}
          <div className="mobile-new-booking-modal__car-section">
            <div className="mobile-new-booking-modal__car-info">
              <div className="mobile-new-booking-modal__car-name">
                {booking.car.make} {booking.car.model}
              </div>
              <div className="mobile-new-booking-modal__car-plate-container">
                <span className="mobile-new-booking-modal__car-plate-number">{licensePlateNumber}</span>
                {licensePlateRegion && (
                  <>
                    <span className="mobile-new-booking-modal__car-plate-divider">|</span>
                    <span className="mobile-new-booking-modal__car-plate-region">{licensePlateRegion}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mobile-new-booking-modal__service-section">
            <div className="mobile-new-booking-modal__datetime">
              {formattedDate}, {formattedTime}
            </div>

            <div className="mobile-new-booking-modal__divider" />

            <div className="mobile-new-booking-modal__service-list">
              {/* Main Service */}
              <div className="mobile-new-booking-modal__service-item">
                <div className="mobile-new-booking-modal__service-info">
                  <span className="mobile-new-booking-modal__service-name">{booking.service.name}</span>
                  <span className="mobile-new-booking-modal__service-duration">
                    {formatDuration(booking.service.duration_minutes)}
                  </span>
                </div>
                <span className="mobile-new-booking-modal__service-price">{booking.service.price}₽</span>
              </div>

              {/* Additional Services */}
              {booking.additionalServices && booking.additionalServices.length > 0 && (
                <>
                  {booking.additionalServices.map((service) => (
                    <div key={service.uuid} className="mobile-new-booking-modal__service-item">
                      <div className="mobile-new-booking-modal__service-info">
                        <span className="mobile-new-booking-modal__service-name">{service.name}</span>
                        <span className="mobile-new-booking-modal__service-duration">
                          {formatDuration(service.duration_minutes)}
                        </span>
                      </div>
                      <span className="mobile-new-booking-modal__service-price">{service.price}₽</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mobile-new-booking-modal__divider" />

            {/* Total */}
            <div className="mobile-new-booking-modal__total">
              <span className="mobile-new-booking-modal__total-label">Итого</span>
              <span className="mobile-new-booking-modal__total-price">{totalPrice}₽</span>
            </div>
          </div>

          {/* Comment Section */}
          {clientComment && (
            <div className="mobile-new-booking-modal__comment-section">
              <div className="mobile-new-booking-modal__comment-label">Комментарий к заказу</div>
              <div className="mobile-new-booking-modal__comment-text">{clientComment}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mobile-new-booking-modal__actions">
            <button 
              className="mobile-new-booking-modal__confirm-button"
              onClick={onConfirm}
            >
              Подтвердить
            </button>
            <button 
              className="mobile-new-booking-modal__cancel-button"
              onClick={onCancel}
            >
              <span>Отменить запись</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStores } from '@/hooks';
import { AppTag } from '@/components/ui/AppTag';
import { formatPrice } from '@/utils/helpers';
import type { BookingStatus } from '@/stores/BookingsStore';
import './MobileViewBookingModal.css';

interface MobileViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingUuid: string;
  onCancel: () => void;
}

// Маппинг статусов на параметры тегов
const STATUS_CONFIG: Record<BookingStatus, { color: 'yellow' | 'blue' | 'green' | 'red'; label: string }> = {
  pending_confirmation: { color: 'yellow', label: 'Ожидает' },
  confirmed: { color: 'blue', label: 'Подтверждена' },
  completed: { color: 'green', label: 'Завершено' },
  cancelled: { color: 'red', label: 'Отменён' },
};

export const MobileViewBookingModal = observer(({
  isOpen,
  onClose,
  bookingUuid,
  onCancel,
}: MobileViewBookingModalProps) => {
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
      <div className="mobile-view-booking-modal">
        <div className="mobile-view-booking-modal__backdrop" onClick={onClose} />
        <div className="mobile-view-booking-modal__container">
          <div className="mobile-view-booking-modal__content">
            <div className="mobile-view-booking-modal__skeleton-header" />
            <div className="mobile-view-booking-modal__skeleton-body">
              <div className="mobile-view-booking-modal__skeleton-car" />
              <div className="mobile-view-booking-modal__skeleton-service" />
            </div>
            <div className="mobile-view-booking-modal__skeleton-footer">
              <div className="mobile-view-booking-modal__skeleton-button" />
            </div>
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

  // Конфигурация статуса
  const statusConfig = STATUS_CONFIG[booking.status as BookingStatus] || STATUS_CONFIG.pending_confirmation;

  // Подсчет итоговой стоимости
  const totalPrice = booking.service.price + 
    (booking.additionalServices?.reduce((sum, service) => sum + service.price, 0) || 0);

  return (
    <div className="mobile-view-booking-modal">
      <div className="mobile-view-booking-modal__backdrop" onClick={onClose} />
      
      <div className="mobile-view-booking-modal__container">
        <div className="mobile-view-booking-modal__content">
          {/* Header */}
          <div className="mobile-view-booking-modal__header">
            <button 
              className="mobile-view-booking-modal__back-button"
              onClick={onClose}
              aria-label="Назад"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className="mobile-view-booking-modal__title">Запись</h2>
            <div className="mobile-view-booking-modal__status-tag">
              <AppTag size="M" color={statusConfig.color}>
                {statusConfig.label}
              </AppTag>
            </div>
          </div>

          <div className="mobile-view-booking-modal__body">
            {/* Car Details */}
            <div className="mobile-view-booking-modal__car-section">
              <div className="mobile-view-booking-modal__car-info">
                <div className="mobile-view-booking-modal__car-name">
                  {booking.car.make} {booking.car.model}
                </div>
                <div className="mobile-view-booking-modal__car-plate-container">
                  <span className="mobile-view-booking-modal__car-plate-number">{licensePlateNumber}</span>
                  {licensePlateRegion && (
                    <>
                      <span className="mobile-view-booking-modal__car-plate-divider">|</span>
                      <span className="mobile-view-booking-modal__car-plate-region">{licensePlateRegion}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mobile-view-booking-modal__service-section">
              <div className="mobile-view-booking-modal__datetime">
                {formattedDate}, {formattedTime}
              </div>

              <div className="mobile-view-booking-modal__divider" />

              <div className="mobile-view-booking-modal__service-list">
                {/* Main Service */}
                <div className="mobile-view-booking-modal__service-item">
                  <span className="mobile-view-booking-modal__service-name">{booking.service.name}</span>
                  <div className="mobile-view-booking-modal__service-info">
                    <span className="mobile-view-booking-modal__service-duration">
                      {formatDuration(booking.service.duration_minutes)}
                    </span>
                    <span className="mobile-view-booking-modal__service-price">{formatPrice(booking.service.price)}₽</span>
                  </div>
                </div>

                {/* Additional Services */}
                {booking.additionalServices && booking.additionalServices.length > 0 && (
                  <>
                    {booking.additionalServices.map((service) => (
                      <div key={service.uuid} className="mobile-view-booking-modal__service-item">
                        <span className="mobile-view-booking-modal__service-name">{service.name}</span>
                        <div className="mobile-view-booking-modal__service-info">
                          <span className="mobile-view-booking-modal__service-duration">
                            {formatDuration(service.duration_minutes)}
                          </span>
                          <span className="mobile-view-booking-modal__service-price">{formatPrice(service.price)}₽</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mobile-view-booking-modal__divider" />

              {/* Total */}
              <div className="mobile-view-booking-modal__total">
                <span className="mobile-view-booking-modal__total-label">Итого</span>
                <span className="mobile-view-booking-modal__total-price">{formatPrice(totalPrice)}₽</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <div className="mobile-view-booking-modal__footer">
              <button 
                className="mobile-view-booking-modal__cancel-button"
                onClick={onCancel}
              >
                <span>Отменить запись</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

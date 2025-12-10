import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStores } from '@/hooks';
import { AppTag } from '@/components/ui/AppTag';
import type { BookingStatus } from '@/stores/BookingsStore';
import './MobileOrderDetailsPage.css';

// Маппинг статусов на параметры тегов
const STATUS_CONFIG: Record<BookingStatus, { color: 'yellow' | 'blue' | 'green' | 'red'; label: string }> = {
  pending_confirmation: { color: 'yellow', label: 'Ожидает' },
  confirmed: { color: 'blue', label: 'Подтверждена' },
  completed: { color: 'green', label: 'Завершено' },
  cancelled: { color: 'red', label: 'Отменён' },
};

export const MobileOrderDetailsPage = observer(() => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { bookingsStore } = useStores();

  useEffect(() => {
    if (uuid) {
      bookingsStore.fetchBookingDetails(uuid);
    }

    return () => {
      bookingsStore.clearSelectedBooking();
    };
  }, [uuid, bookingsStore]);

  const handleBack = () => {
    // Если есть данные о заказе, переходим на страницу заказов с датой этого заказа
    if (booking?.start_time) {
      const bookingDate = format(parseISO(booking.start_time), 'yyyy-MM-dd');
      navigate(`/orders?date=${bookingDate}`);
    } else {
      navigate(-1);
    }
  };

  const handleCancel = async () => {
    if (!uuid) return;

    const confirmed = window.confirm('Вы уверены, что хотите отменить эту запись?');
    if (!confirmed) return;

    try {
      const success = await bookingsStore.updateBookingStatus(uuid, 'cancelled');
      
      if (success) {
        // Возвращаемся на страницу заказов с датой этого заказа
        if (booking?.start_time) {
          const bookingDate = format(parseISO(booking.start_time), 'yyyy-MM-dd');
          navigate(`/orders?date=${bookingDate}`);
        } else {
          navigate(-1);
        }
        // Обновляем список заказов
        bookingsStore.fetchBookings();
      }
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
    }
  };

  const booking = bookingsStore.selectedBooking;

  if (bookingsStore.isLoadingDetails) {
    return (
      <div className="mobile-order-details-page">
        <div className="mobile-order-details-page__content">
          <div className="mobile-order-details-page__skeleton-header" />
          <div className="mobile-order-details-page__skeleton-body">
            <div className="mobile-order-details-page__skeleton-car" />
            <div className="mobile-order-details-page__skeleton-service" />
          </div>
          <div className="mobile-order-details-page__skeleton-footer">
            <div className="mobile-order-details-page__skeleton-button" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mobile-order-details-page">
        <div className="mobile-order-details-page__error">
          Заказ не найден
        </div>
      </div>
    );
  }

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
    <div className="mobile-order-details-page">
      <div className="mobile-order-details-page__content">
        {/* Header */}
        <div className="mobile-order-details-page__header">
          <button 
            className="mobile-order-details-page__back-button"
            onClick={handleBack}
            aria-label="Назад"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="mobile-order-details-page__title">Запись</h2>
          <div className="mobile-order-details-page__status-tag">
            <AppTag size="M" color={statusConfig.color}>
              {statusConfig.label}
            </AppTag>
          </div>
        </div>

        <div className="mobile-order-details-page__body">
          {/* Car Details */}
          <div className="mobile-order-details-page__car-section">
            <div className="mobile-order-details-page__car-info">
              <div className="mobile-order-details-page__car-name">
                {booking.car.make} {booking.car.model}
              </div>
              <div className="mobile-order-details-page__car-plate-container">
                <span className="mobile-order-details-page__car-plate-number">{licensePlateNumber}</span>
                {licensePlateRegion && (
                  <>
                    <span className="mobile-order-details-page__car-plate-divider">|</span>
                    <span className="mobile-order-details-page__car-plate-region">{licensePlateRegion}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mobile-order-details-page__service-section">
            <div className="mobile-order-details-page__datetime">
              {formattedDate}, {formattedTime}
            </div>

            <div className="mobile-order-details-page__divider" />

            <div className="mobile-order-details-page__service-list">
              {/* Main Service */}
              <div className="mobile-order-details-page__service-item">
                <span className="mobile-order-details-page__service-name">{booking.service.name}</span>
                <div className="mobile-order-details-page__service-info">
                  <span className="mobile-order-details-page__service-duration">
                    {formatDuration(booking.service.duration_minutes)}
                  </span>
                  <span className="mobile-order-details-page__service-price">{booking.service.price}₽</span>
                </div>
              </div>

              {/* Additional Services */}
              {booking.additionalServices && booking.additionalServices.length > 0 && (
                <>
                  {booking.additionalServices.map((service) => (
                    <div className="mobile-order-details-page__service-item">
                      <span className="mobile-order-details-page__service-name">{service.name}</span>
                      <div className="mobile-order-details-page__service-info">
                        <span className="mobile-order-details-page__service-duration">
                          {formatDuration(service.duration_minutes)}
                        </span>
                        <span className="mobile-order-details-page__service-price">{service.price}₽</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mobile-order-details-page__divider" />

            {/* Total */}
            <div className="mobile-order-details-page__total">
              <span className="mobile-order-details-page__total-label">Итого</span>
              <span className="mobile-order-details-page__total-price">{totalPrice}₽</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="mobile-order-details-page__footer">
            <button 
              className="mobile-order-details-page__cancel-button"
              onClick={handleCancel}
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
  );
});

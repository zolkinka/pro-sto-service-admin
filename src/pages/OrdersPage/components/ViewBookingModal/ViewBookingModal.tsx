import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStores } from '@/hooks';
import { AppTag } from '@/components/ui/AppTag';
import { NotificationIcon } from '@/components/ui/icons';
import { formatPrice } from '@/utils/helpers';
import type { BookingStatus } from '@/stores/BookingsStore';
import type { BookingCarDto } from '../../../../../services/api-client/types.gen';
import './ViewBookingModal.css';

// Расширенный тип для автомобиля с дополнительными полями
type BookingCarWithImage = BookingCarDto & {
  generated_image?: string;
};

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingUuid: string;
  onUpdate: () => void;
  showAsNewBooking?: boolean;
  pendingCount?: number;
  currentPendingIndex?: number;
}

// Маппинг статусов на параметры тегов
const STATUS_CONFIG: Record<BookingStatus, { color: 'yellow' | 'blue' | 'green' | 'red'; label: string }> = {
  pending_confirmation: { color: 'yellow', label: 'Ожидает' },
  confirmed: { color: 'blue', label: 'Подтвержден' },
  completed: { color: 'green', label: 'Завершено' },
  cancelled: { color: 'red', label: 'Отменён' },
};

const ViewBookingModal = observer(({ 
  isOpen, 
  onClose, 
  bookingUuid, 
  onUpdate, 
  showAsNewBooking = false,
  pendingCount,
  currentPendingIndex,
}: ViewBookingModalProps) => {
  const { bookingsStore, toastStore } = useStores();

  useEffect(() => {
    if (isOpen && bookingUuid) {
      bookingsStore.fetchBookingDetails(bookingUuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookingUuid]);

  useEffect(() => {
    // Блокируем скролл при открытии модалки
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

  const handleConfirm = async () => {
    try {
      const success = await bookingsStore.updateBookingStatus(bookingUuid, 'confirmed');
      
      if (success) {
        toastStore.showSuccess('Заказ подтвержден');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Ошибка подтверждения заказа:', error);
      toastStore.showError('Не удалось подтвердить заказ');
    }
  };

  const handleCancelBooking = async () => {
    const confirmed = window.confirm('Вы уверены, что хотите отменить эту запись?');
    if (!confirmed) return;

    const success = await bookingsStore.updateBookingStatus(bookingUuid, 'cancelled');
    if (success) {
      onUpdate();
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const booking = bookingsStore.selectedBooking;

  // Состояние загрузки
  if (bookingsStore.isLoadingDetails) {
    return (
      <div className="view-booking-modal">
        <div className="view-booking-modal__skeleton-header">
          <div className="view-booking-modal__skeleton view-booking-modal__skeleton-title" />
          <div className="view-booking-modal__skeleton view-booking-modal__skeleton-tag" />
        </div>
        <div className="view-booking-modal__skeleton-content">
          <div className="view-booking-modal__skeleton view-booking-modal__skeleton-car-section" />
          <div className="view-booking-modal__skeleton view-booking-modal__skeleton-service-section" />
          <div className="view-booking-modal__skeleton-footer">
            <div className="view-booking-modal__skeleton view-booking-modal__skeleton-button" />
            <div className="view-booking-modal__skeleton view-booking-modal__skeleton-button" />
          </div>
        </div>
      </div>
    );
  }

  // Обработка ошибок
  if (!booking && bookingsStore.error) {
    return (
      <div className="view-booking-modal">
        <div className="view-booking-modal__header">
          <h2 className="view-booking-modal__title">Ошибка</h2>
          <button className="view-booking-modal__close" onClick={handleClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="view-booking-modal__content">
          <p>Не удалось загрузить информацию о бронировании</p>
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
    
    // Проверяем, что даты валидны
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid dates in booking:', booking);
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

  // Форматирование госномера - может быть строкой или объектом
  const licensePlateData = booking.car.license_plate;
  let licensePlateNumber = 'Не указан';
  let licensePlateRegion: string | null = null;

  if (typeof licensePlateData === 'string') {
    // Если license_plate это строка (AdminBookingCarDto)
    licensePlateNumber = licensePlateData || 'Не указан';
  } else if (licensePlateData && typeof licensePlateData === 'object') {
    // Если license_plate это объект (BookingCarDto)
    const plate = licensePlateData as { number?: string; region?: string };
    licensePlateNumber = plate.number || 'Не указан';
    licensePlateRegion = plate.region || null;
  }

  // Конфигурация статуса
  const statusConfig = STATUS_CONFIG[booking.status as BookingStatus] || STATUS_CONFIG.pending_confirmation;

  // Форматирование длительности в минутах
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} ч ${remainingMinutes} мин` : `${hours} ч`;
  };

  // Получаем комментарий как строку (client_comment может быть строкой или null, но типизирован как object | null)
  const clientComment = typeof booking.client_comment === 'string' ? booking.client_comment : null;

  // Подсчет итоговой стоимости
  const totalPrice = booking.service.price + 
    (booking.additionalServices?.reduce((sum, service) => sum + service.price, 0) || 0);

  return (
    <div className="view-booking-modal">
      <div className="view-booking-modal__header">
        <h2 className="view-booking-modal__title">Запись</h2>
        <AppTag size="M" color={statusConfig.color}>
          {statusConfig.label}
        </AppTag>
        {!showAsNewBooking && (
          <button className="view-booking-modal__close" onClick={handleClose} aria-label="Закрыть">
            ×
          </button>
        )}
      </div>

      <div className="view-booking-modal__content">
        {/* Блок уведомления "Новая запись" */}
        {showAsNewBooking && (
          <div className="view-booking-modal__notification">
            <NotificationIcon />
            <span>Новая запись</span>
            {pendingCount !== undefined && currentPendingIndex !== undefined && pendingCount > 1 && (
              <span className="view-booking-modal__counter">
                {currentPendingIndex + 1} из {pendingCount}
              </span>
            )}
          </div>
        )}

        {/* Блок информации об автомобиле */}
        <div className="view-booking-modal__car-section">
          {(booking.car as BookingCarWithImage).generated_image && (booking.car as BookingCarWithImage).generated_image!.trim() !== '' && (
            <div className="view-booking-modal__car-image">
              <img
                src={`${import.meta.env.VITE_BASE_STATIC_PATH}${(booking.car as BookingCarWithImage).generated_image}`}
                alt={`${booking.car.make} ${booking.car.model}`}
                className="view-booking-modal__car-photo"
              />
            </div>
          )}
          <div className="view-booking-modal__car-info">
            <div className="view-booking-modal__car-name">{booking.car.make} {booking.car.model}</div>
            <div className="view-booking-modal__car-plate-container">
              <span className="view-booking-modal__car-plate-number">{licensePlateNumber}</span>
              {licensePlateRegion && (
                <>
                  <span className="view-booking-modal__car-plate-divider">|</span>
                  <span className="view-booking-modal__car-plate-region">{licensePlateRegion}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Блок информации об услуге */}
        <div className="view-booking-modal__service-section">
          <div className="view-booking-modal__datetime">
            {formattedDate}, {formattedTime}
          </div>

          <div className="view-booking-modal__divider" />

          <div className="view-booking-modal__service-list">
            {/* Основная услуга */}
            <div className="view-booking-modal__service-item">
              <span className="view-booking-modal__service-name">{booking.service.name}</span>
              <div className="view-booking-modal__service-info">
                <span className="view-booking-modal__service-duration">
                  {formatDuration(booking.service.duration_minutes)}
                </span>
                <span className="view-booking-modal__service-price">{formatPrice(booking.service.price)}₽</span>
              </div>
            </div>

            {/* Дополнительные услуги */}
            {booking.additionalServices && booking.additionalServices.length > 0 && (
              <>
                {booking.additionalServices.map((service) => (
                  <div key={service.uuid} className="view-booking-modal__service-item">
                    <span className="view-booking-modal__service-name">{service.name}</span>
                    <div className="view-booking-modal__service-info">
                      <span className="view-booking-modal__service-duration">
                        {formatDuration(service.duration_minutes)}
                      </span>
                      <span className="view-booking-modal__service-price">{formatPrice(service.price)}₽</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="view-booking-modal__divider" />

          {/* Итого */}
          <div className="view-booking-modal__total">
            <span className="view-booking-modal__total-label">Итого</span>
            <span className="view-booking-modal__total-price">{formatPrice(totalPrice)}₽</span>
          </div>
        </div>

        {/* Блок комментария к заказу */}
        {clientComment && (
          <div className="view-booking-modal__comment-section">
            <div className="view-booking-modal__comment-label">Комментарий к заказу</div>
            <div className="view-booking-modal__comment-text">{clientComment}</div>
          </div>
        )}

        {/* Футер с кнопками */}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="view-booking-modal__footer">
            {showAsNewBooking && (
              <button 
                className="view-booking-modal__confirm-button"
                onClick={handleConfirm}
              >
                Подтвердить
              </button>
            )}
            <button className="view-booking-modal__cancel-button" onClick={handleCancelBooking}>
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

export default ViewBookingModal;

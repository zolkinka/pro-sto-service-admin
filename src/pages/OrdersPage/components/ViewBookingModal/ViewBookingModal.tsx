import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStores } from '@/hooks';
import { AppTag } from '@/components/ui/AppTag';
import { NotificationIcon } from '@/components/ui/icons';
import type { BookingStatus } from '@/stores/BookingsStore';
import './ViewBookingModal.css';

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
  }, [isOpen, bookingUuid, bookingsStore]);

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
        <div className="view-booking-modal__header">
          <h2 className="view-booking-modal__title">Загрузка...</h2>
          <button className="view-booking-modal__close" onClick={handleClose} aria-label="Закрыть">
            ×
          </button>
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
  const startDate = parseISO(booking.start_time);
  const endDate = parseISO(booking.end_time);
  const formattedDate = format(startDate, 'd MMMM', { locale: ru });
  const formattedTime = `${format(startDate, 'HH:mm')}-${format(endDate, 'HH:mm')}`;

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
              <div className="view-booking-modal__service-info">
                <span className="view-booking-modal__service-name">{booking.service.name}</span>
                <span className="view-booking-modal__service-duration">
                  {formatDuration(booking.service.duration_minutes)}
                </span>
              </div>
              <span className="view-booking-modal__service-price">{booking.service.price}₽</span>
            </div>

            {/* Дополнительные услуги */}
            {booking.additionalServices && booking.additionalServices.length > 0 && (
              <>
                {booking.additionalServices.map((service) => (
                  <div key={service.uuid} className="view-booking-modal__service-item">
                    <div className="view-booking-modal__service-info">
                      <span className="view-booking-modal__service-name">{service.name}</span>
                      <span className="view-booking-modal__service-duration">
                        {formatDuration(service.duration_minutes)}
                      </span>
                    </div>
                    <span className="view-booking-modal__service-price">{service.price}₽</span>
                  </div>
                ))}
              </>
            )}
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

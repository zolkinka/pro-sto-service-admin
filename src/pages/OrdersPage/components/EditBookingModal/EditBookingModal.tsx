import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { parseISO } from 'date-fns';
import { bookingsStore, toastStore } from '@/stores';
import type { DetailedBookingResponseDto } from '../../../../../services/api-client';
import AppInput from '@/components/ui/AppInput';
import { AppTag } from '@/components/ui/AppTag';
import { AppSingleSelect } from '@/components/ui/AppSingleSelect';
import type { SelectOption } from '@/components/ui/AppSingleSelect/AppSingleSelect.types';
import './EditBookingModal.css';

interface EditBookingModalProps {
  isOpen: boolean;
  startHour: number;
  endHour: number;
  onClose: () => void;
  bookingUuid: string;
  onUpdate: () => void;
}

interface FormData {
  startHour: number;
  serviceName: string;
  additionalService: string;
  comment: string;
}

const EditBookingModal: React.FC<EditBookingModalProps> = observer(({
  isOpen,
  startHour,
  endHour,
  onClose,
  bookingUuid,
  onUpdate,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<DetailedBookingResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    startHour: 9,
    serviceName: '',
    additionalService: '',
    comment: '',
  });

  // Загрузка данных бронирования при открытии
  const loadBookingData = useCallback(async () => {
    setIsLoading(true);
    try {
      await bookingsStore.fetchBookingDetails(bookingUuid);
      const bookingData = bookingsStore.selectedBooking;
      
      if (bookingData) {
        setBooking(bookingData);
        
        // Парсим час из start_time
        const startTime = parseISO(bookingData.start_time);
        const hour = startTime.getHours();
        
        setFormData({
          startHour: hour,
          serviceName: bookingData.service.name,
          additionalService: bookingData.additionalServices?.[0]?.name || '',
          comment: typeof bookingData.client_comment === 'string' ? bookingData.client_comment : '',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных бронирования:', error);
      toastStore.showError('Не удалось загрузить данные заказа');
    } finally {
      setIsLoading(false);
    }
  }, [bookingUuid]);

  useEffect(() => {
    if (isOpen && bookingUuid) {
      loadBookingData();
    }
  }, [isOpen, bookingUuid, loadBookingData]);

  // Сброс прокрутки при открытии модального окна
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // Вычисляем продолжительность в часах из данных бронирования
  const durationInHours = useMemo(() => {
    if (!booking) return 1;
    const start = parseISO(booking.start_time);
    const end = parseISO(booking.end_time);
    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.max(1, Math.round(diffInMinutes / 60));
  }, [booking]);

  // Опции для селекта времени - показываем диапазоны
  const timeRangeOptions: SelectOption[] = useMemo(() => {
    const options: SelectOption[] = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      const startTimeString = `${hour.toString().padStart(2, '0')}:00`;
      const endHour = hour + durationInHours;
      const endTimeString = `${endHour.toString().padStart(2, '0')}:00`;
      options.push({
        label: `${startTimeString}-${endTimeString}`,
        value: hour.toString(),
      });
    }
    return options;
  }, [startHour, endHour, durationInHours]);

  const handleStartTimeChange = (option: SelectOption | null) => {
    if (option) {
      const valueStr = typeof option.value === 'string' ? option.value : String(option.value);
      setFormData({ ...formData, startHour: parseInt(valueStr, 10) });
    }
  };

  const handleServiceNameChange = (value: string) => {
    setFormData({ ...formData, serviceName: value });
  };

  const handleAdditionalServiceChange = (value: string) => {
    setFormData({ ...formData, additionalService: value });
  };

  const handleCommentChange = (value: string) => {
    setFormData({ ...formData, comment: value });
  };

  const handleCancel = async () => {
    if (!window.confirm('Вы уверены, что хотите отменить этот заказ?')) {
      return;
    }

    try {
      const success = await bookingsStore.updateBookingStatus(bookingUuid, 'cancelled');
      if (success) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
    }
  };

  if (!isOpen) return null;

  // Маппинг статусов для тегов
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return { label: 'Ожидает', color: 'yellow' as const };
      case 'confirmed':
        return { label: 'Подтвержден', color: 'blue' as const };
      case 'completed':
        return { label: 'Выполнен', color: 'green' as const };
      case 'cancelled':
        return { label: 'Отменен', color: 'red' as const };
      default:
        return { label: 'Неизвестен', color: 'default' as const };
    }
  };

  const statusConfig = booking ? getStatusConfig(booking.status) : { label: '', color: 'default' as const };

  // Форматируем license_plate
  const formatLicensePlate = (licensePlate: unknown) => {
    if (typeof licensePlate === 'object' && licensePlate !== null) {
      const plate = licensePlate as Record<string, unknown>;
      const number = typeof plate.number === 'string' ? plate.number : '';
      const region = typeof plate.region === 'string' || typeof plate.region === 'number' ? String(plate.region) : '';
      return { number, region };
    }
    return { number: '', region: '' };
  };

  const licensePlateData = booking?.car?.license_plate ? formatLicensePlate(booking.car.license_plate) : { number: '', region: '' };

  // Компонент иконки крестика
  const CloseIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="edit-booking-modal" ref={modalRef}>
      {isLoading ? (
        <div className="edit-booking-modal__loading">Загрузка...</div>
        ) : booking ? (
          <>
            {/* Заголовок */}
            <div className="edit-booking-modal__header">
              <div className="edit-booking-modal__header-content">
                <h2 className="edit-booking-modal__title">Запись</h2>
                <AppTag size="M" color={statusConfig.color}>
                  {statusConfig.label}
                </AppTag>
              </div>
              <button
                type="button"
                className="edit-booking-modal__close-button"
                onClick={onClose}
                aria-label="Закрыть"
              >
                <CloseIcon />
              </button>
            </div>            {/* Информация о машине */}
            <div className="edit-booking-modal__car-info">
              <div className="edit-booking-modal__car-image">
                <div className="edit-booking-modal__car-placeholder" />
              </div>
              <div className="edit-booking-modal__car-details">
                <div className="edit-booking-modal__car-model">
                  {booking.car.make} {booking.car.model}
                </div>
                <div className="edit-booking-modal__car-plate">
                  <span>{licensePlateData.number}</span>
                  {licensePlateData.region && (
                    <>
                      <span className="edit-booking-modal__car-plate-divider">|</span>
                      <span>{licensePlateData.region}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Форма */}
            <div className="edit-booking-modal__content">
              {/* Продолжительность */}
              <div className="edit-booking-modal__field">
                <label className="edit-booking-modal__label">Продолжительность</label>
                <AppSingleSelect
                  value={timeRangeOptions.find(opt => opt.value === formData.startHour.toString()) || null}
                  options={timeRangeOptions}
                  onChange={handleStartTimeChange}
                  placeholder="Выберите время"
                />
              </div>

              {/* Название услуги */}
              <div className="edit-booking-modal__field">
                <AppInput
                  label="Название услуги"
                  value={formData.serviceName}
                  onChange={handleServiceNameChange}
                />
              </div>

              {/* Дополнительная услуга */}
              <div className="edit-booking-modal__field">
                <AppInput
                  label="Дополнительная услуга"
                  value={formData.additionalService}
                  onChange={handleAdditionalServiceChange}
                />
              </div>

              {/* Комментарий к заказу */}
              <div className="edit-booking-modal__field">
                <AppInput
                  label="Комментарий к заказу"
                  value={formData.comment}
                  onChange={handleCommentChange}
                  placeholder=""
                />
              </div>
            </div>

            {/* Кнопка отмены */}
            <div className="edit-booking-modal__footer">
              <button
                type="button"
                className="edit-booking-modal__cancel-button"
                onClick={handleCancel}
              >
                Отменить
              </button>
            </div>
          </>
        ) : (
          <div className="edit-booking-modal__error">Не удалось загрузить данные заказа</div>
        )}
    </div>
  );
});

EditBookingModal.displayName = 'EditBookingModal';

export default EditBookingModal;

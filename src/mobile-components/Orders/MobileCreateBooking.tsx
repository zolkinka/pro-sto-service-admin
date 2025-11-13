import { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useStores } from '@/hooks';
import { AppInput, AppButton } from '@/components/ui';
import { AppSingleSelect } from '@/components/ui/AppSingleSelect';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import type { SelectOption } from '@/components/ui/AppSingleSelect/AppSingleSelect.types';
import { 
  carsControllerGetMakes,
  carsControllerGetModelsByMakeId,
  adminFindOrCreateClient,
  adminCreateOrUpdateCar,
  adminCreateBooking,
  serviceCenterGetSlots,
} from '../../../services/api-client';
import { MobileConfirmBookingModal } from '@/mobile-components/Orders/MobileConfirmBookingModal';
import './MobileCreateBooking.css';

interface LocationState {
  initialDate?: Date;
  initialTime?: string;
}

interface CarMake {
  id?: string;
  name?: string;
}

interface CarModel {
  id?: string;
  name?: string;
}

export const MobileCreateBooking = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { servicesStore, toastStore, authStore, bookingsStore } = useStores();
  
  const locationState = location.state as LocationState | null;

  // Form state
  const [phone, setPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedMake, setSelectedMake] = useState<SelectOption | null>(null);
  const [selectedModel, setSelectedModel] = useState<SelectOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    locationState?.initialDate ? new Date(locationState.initialDate) : null
  );
  const [selectedTime, setSelectedTime] = useState(locationState?.initialTime || '');
  const [selectedService, setSelectedService] = useState<SelectOption | null>(null);
  const [comment, setComment] = useState('');
  
  // Data state
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available time slots state
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Confirm modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdBookingUuid, setCreatedBookingUuid] = useState<string | null>(null);

  // Load makes on mount
  useEffect(() => {
    const loadMakes = async () => {
      try {
        const response = await carsControllerGetMakes({ limit: 1000 });
        setMakes(response.data || []);
      } catch (error) {
        console.error('Failed to load car makes:', error);
        toastStore.showError('Не удалось загрузить марки автомобилей');
      }
    };

    loadMakes();
  }, [toastStore]);

  // Load models when make is selected
  useEffect(() => {
    const loadModels = async (makeId: string) => {
      setIsLoadingModels(true);
      try {
        const response = await carsControllerGetModelsByMakeId({ id: makeId, limit: 1000 });
        setModels(response.data || []);
      } catch (error) {
        console.error('Failed to load car models:', error);
        toastStore.showError('Не удалось загрузить модели автомобилей');
      } finally {
        setIsLoadingModels(false);
      }
    };

    if (selectedMake) {
      loadModels(selectedMake.value.toString());
    } else {
      setModels([]);
      setSelectedModel(null);
    }
  }, [selectedMake, toastStore]);

  // Load services on mount
  useEffect(() => {
    if (servicesStore.services.length === 0) {
      servicesStore.fetchServices();
    }
  }, [servicesStore]);

  // Auto-select first main service when services are loaded
  useEffect(() => {
    if (servicesStore.mainServices.length > 0 && !selectedService) {
      const firstService = servicesStore.mainServices[0];
      setSelectedService({
        label: firstService.name,
        value: firstService.uuid,
      });
    }
  }, [servicesStore.mainServices, selectedService]);

  // Load available slots when date or service changes
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate || !selectedService || !authStore.user?.service_center_uuid) {
        setAvailableTimeSlots([]);
        setIsLoadingSlots(false);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await serviceCenterGetSlots({
          uuid: authStore.user.service_center_uuid,
          serviceUuid: selectedService.value.toString(),
          date: dateStr,
        });

        const slots = response.map((timeSlot: string) => {
          const slotDate = new Date(timeSlot);
          const hours = slotDate.getHours().toString().padStart(2, '0');
          const minutes = slotDate.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        });

        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error('Failed to load available slots:', error);
        toastStore.showError('Не удалось загрузить доступные слоты');
        setAvailableTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate, selectedService, authStore.user, toastStore]);

  const makeOptions: SelectOption[] = makes
    .filter(make => make.id && make.name)
    .map(make => ({
      label: make.name!,
      value: make.id!,
    }));

  const modelOptions: SelectOption[] = models
    .filter(model => model.id && model.name)
    .map(model => ({
      label: model.name!,
      value: model.id!,
    }));

  const mainServiceOptions: SelectOption[] = servicesStore.services
    .filter(service => service.service_type === 'main')
    .map(service => ({
      label: service.name,
      value: service.uuid,
    }));

  // Вычисление общей стоимости
  const totalCost = useMemo(() => {
    if (!selectedService) return 0;
    
    const service = servicesStore.services.find(s => s.uuid === selectedService.value);
    if (!service) return 0;
    
    return service.price || 0;
  }, [selectedService, servicesStore.services]);

  const handleBack = () => {
    navigate('/orders');
  };

  const handleSubmit = async () => {
    // Validation
    if (!phone || phone.trim() === '') {
      toastStore.showError('Введите номер телефона');
      return;
    }

    if (!licensePlate.trim()) {
      toastStore.showError('Введите номер автомобиля');
      return;
    }

    if (!selectedMake || !selectedModel) {
      toastStore.showError('Выберите марку и модель автомобиля');
      return;
    }

    if (!selectedDate) {
      toastStore.showError('Выберите дату');
      return;
    }

    if (!selectedTime) {
      toastStore.showError('Выберите время');
      return;
    }

    if (!selectedService) {
      toastStore.showError('Выберите услугу');
      return;
    }

    if (!authStore.user?.service_center_uuid) {
      toastStore.showError('Не найден UUID сервисного центра');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create/find client
      let cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone.startsWith('7') && cleanPhone.length === 10) {
        cleanPhone = '7' + cleanPhone;
      }
      cleanPhone = '+' + cleanPhone;
      
      const clientResponse = await adminFindOrCreateClient({
        requestBody: { phone: cleanPhone }
      });

      // 2. Create/update car
      const carResponse = await adminCreateOrUpdateCar({
        clientUuid: clientResponse.uuid,
        requestBody: {
          license_plate: licensePlate,
          make: selectedMake.label,
          model: selectedModel.label,
          make_id: String(selectedMake.value),
          model_id: String(selectedModel.value),
        }
      });

      // 3. Create booking
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const bookingResponse = await adminCreateBooking({
        requestBody: {
          service_center_uuid: authStore.user.service_center_uuid,
          client_uuid: clientResponse.uuid,
          car_uuid: carResponse.uuid,
          service_uuid: String(selectedService.value),
          start_time: startTime.toISOString(),
          payment_method: 'cash',
          additional_service_uuids: [],
          admin_comment: comment || undefined,
        }
      });

      toastStore.showSuccess('Запись успешно создана');
      
      // Show confirm modal
      setCreatedBookingUuid(bookingResponse.uuid);
      await bookingsStore.fetchBookingDetails(bookingResponse.uuid);
      setShowConfirmModal(true);
    } catch (error: unknown) {
      console.error('Failed to create booking:', error);
      
      const apiError = error as { status?: number };
      if (apiError?.status === 409) {
        toastStore.showError('Временной слот уже занят');
      } else if (apiError?.status === 404) {
        toastStore.showError('Не найдены необходимые данные');
      } else if (apiError?.status === 400) {
        toastStore.showError('Некорректные данные запроса');
      } else {
        toastStore.showError('Не удалось создать запись');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmModalClose = () => {
    setShowConfirmModal(false);
    navigate('/orders');
  };

  const handleCancelBooking = async () => {
    if (!createdBookingUuid) return;

    const success = await bookingsStore.updateBookingStatus(createdBookingUuid, 'cancelled');
    if (success) {
      setShowConfirmModal(false);
      navigate('/orders');
    }
  };

  return (
    <div className="mobile-create-booking">
      <div className="mobile-create-booking__header">
        <button 
          className="mobile-create-booking__back"
          onClick={handleBack}
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </button>
        <h1 className="mobile-create-booking__title">Новая запись</h1>
      </div>

      <div className="mobile-create-booking__content">
        <div className="mobile-create-booking__field">
          <AppInput
            label="Номер телефона"
            placeholder="+7"
            value={phone}
            onChange={setPhone}
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppSingleSelect
            label="Модель"
            placeholder="Выберите модель"
            options={modelOptions}
            value={selectedModel}
            onChange={setSelectedModel}
            disabled={!selectedMake || isLoadingModels}
            clearable
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppInput
            label="Номер автомобиля"
            placeholder="A000AA 111"
            value={licensePlate}
            onChange={setLicensePlate}
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppSingleSelect
            label="Марка"
            placeholder="Выберите марку"
            options={makeOptions}
            value={selectedMake}
            onChange={setSelectedMake}
            clearable
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppDatePicker
            label="Дата"
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppTimePicker
            label="Время"
            value={selectedTime}
            onChange={setSelectedTime}
            placeholder="09:00"
            availableSlots={availableTimeSlots}
            disabled={isLoadingSlots || !selectedDate || !selectedService}
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppSingleSelect
            label="Услуга"
            placeholder="Выберите услугу"
            options={mainServiceOptions}
            value={selectedService}
            onChange={setSelectedService}
            clearable
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppInput
            label="Комментарий"
            placeholder=""
            value={comment}
            onChange={setComment}
          />
        </div>

        <div className="mobile-create-booking__actions">
          <AppButton
            onClick={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {totalCost > 0 ? `Создать заказ ${totalCost}₽` : 'Создать заказ'}
          </AppButton>
        </div>
      </div>

      {bookingsStore.selectedBooking && (
        <MobileConfirmBookingModal
          isOpen={showConfirmModal}
          onClose={handleConfirmModalClose}
          onCancel={handleCancelBooking}
          booking={bookingsStore.selectedBooking}
        />
      )}
    </div>
  );
});

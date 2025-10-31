import { useState, useEffect, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks';
import { AppPhoneInput } from '@/components/ui/AppPhoneInput';
import { AppInput } from '@/components/ui';
import { AppSingleSelect } from '@/components/ui/AppSingleSelect';
import { AppMultiSelect } from '@/components/ui/AppMultiSelect';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import { AppButton } from '@/components/ui';
import { 
  carsControllerGetMakes, 
  carsControllerGetModelsByMakeId,
  adminFindOrCreateClient,
  adminCreateOrUpdateCar,
  adminCreateBooking,
} from '../../../../../services/api-client';
import type { SelectOption } from '@/components/ui/AppSingleSelect/AppSingleSelect.types';
import type { SelectOption as MultiSelectOption } from '@/components/ui/AppMultiSelect/AppMultiSelect.types';
import './CreateBookingModal.css';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
  markId?: string;
}

const CreateBookingModal = observer(({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialDate,
  initialTime,
}: CreateBookingModalProps) => {
  const { servicesStore, toastStore, authStore } = useStores();

  // Form state
  const [phone, setPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedMake, setSelectedMake] = useState<SelectOption | null>(null);
  const [selectedModel, setSelectedModel] = useState<SelectOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [selectedTime, setSelectedTime] = useState(initialTime || '');
  const [selectedService, setSelectedService] = useState<SelectOption | null>(null);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<MultiSelectOption[]>([]);
  const [comment, setComment] = useState('');
  
  // Data state
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation state
  const [phoneError, setPhoneError] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const loadMakes = useCallback(async () => {
    try {
      const response = await carsControllerGetMakes({ limit: 1000 });
      setMakes(response.data || []);
    } catch (error) {
      console.error('Failed to load car makes:', error);
      toastStore.showError('Не удалось загрузить марки автомобилей');
    }
  }, [toastStore]);

  const loadModels = useCallback(async (makeId: string) => {
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
  }, [toastStore]);

  // Load services on mount
  useEffect(() => {
    if (isOpen && servicesStore.services.length === 0) {
      servicesStore.fetchServices();
    }
  }, [isOpen, servicesStore]);

  // Load car makes on mount
  useEffect(() => {
    if (isOpen && makes.length === 0) {
      loadMakes();
    }
  }, [isOpen, makes.length, loadMakes]);

  // Load models when make is selected
  useEffect(() => {
    if (selectedMake) {
      loadModels(selectedMake.value.toString());
    } else {
      setModels([]);
      setSelectedModel(null);
    }
  }, [selectedMake, loadModels]);

  // Block body scroll when modal is open
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

  // Prepare options for selects
  const makeOptions: SelectOption[] = useMemo(() => {
    return makes
      .filter(make => make.id && make.name)
      .map(make => ({
        label: make.name!,
        value: make.id!,
      }));
  }, [makes]);

  const modelOptions: SelectOption[] = useMemo(() => {
    return models
      .filter(model => model.id && model.name)
      .map(model => ({
        label: model.name!,
        value: model.id!,
      }));
  }, [models]);

  const mainServiceOptions: SelectOption[] = useMemo(() => {
    return servicesStore.services
      .filter(service => service.service_type === 'main')
      .map(service => ({
        label: service.name,
        value: service.uuid,
      }));
  }, [servicesStore.services]);

  const additionalServiceOptions: MultiSelectOption[] = useMemo(() => {
    return servicesStore.services
      .filter(service => service.service_type === 'additional')
      .map(service => ({
        label: service.name,
        value: service.uuid,
      }));
  }, [servicesStore.services]);

  const handlePhoneChange = (cleanPhone: string) => {
    setPhone(cleanPhone);
  };

  const handlePhoneValidate = (isValid: boolean, cleanPhone: string) => {
    setIsPhoneValid(isValid);
    if (!isValid && cleanPhone.length > 0) {
      setPhoneError('Введите корректный номер телефона');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!isPhoneValid) {
      toastStore.showError('Введите корректный номер телефона');
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
      // Формируем телефон в формате +7XXXXXXXXXX
      // phone уже содержит только цифры без +7 (из extractPhoneDigits)
      const cleanPhone = `+7${phone.replace(/\D/g, '')}`;
      
      // 1. Найти или создать клиента
      const clientResponse = await adminFindOrCreateClient({
        requestBody: { phone: cleanPhone }
      });

      // 2. Создать или обновить автомобиль
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

      // 3. Формируем дату и время начала бронирования
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      // 4. Создать бронирование
      await adminCreateBooking({
        requestBody: {
          service_center_uuid: authStore.user.service_center_uuid,
          client_uuid: clientResponse.uuid,
          car_uuid: carResponse.uuid,
          service_uuid: String(selectedService.value),
          start_time: startTime.toISOString(),
          payment_method: 'cash', // По умолчанию наличные
          additional_service_uuids: selectedAdditionalServices.map(s => String(s.value)),
          admin_comment: comment || undefined,
        }
      });

      toastStore.showSuccess('Запись успешно создана');
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      console.error('Failed to create booking:', error);
      
      // Обработка различных ошибок
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

  const handleClose = () => {
    // Reset form
    setPhone('');
    setLicensePlate('');
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedDate(initialDate || null);
    setSelectedTime(initialTime || '');
    setSelectedService(null);
    setSelectedAdditionalServices([]);
    setComment('');
    setPhoneError('');
    setIsPhoneValid(false);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="create-booking-modal">
      <div className="create-booking-modal__header">
        <h2 className="create-booking-modal__title">Добавление записи</h2>
        <button 
          className="create-booking-modal__close" 
          onClick={handleClose} 
          aria-label="Закрыть"
          disabled={isSubmitting}
        >
          ×
        </button>
      </div>

      <div className="create-booking-modal__body">
        <div className="create-booking-modal__field">
          <AppPhoneInput
            label="Введите номер телефона"
            placeholder="+7 999 888 77 66"
            onChange={handlePhoneChange}
            onValidate={handlePhoneValidate}
            error={phoneError}
          />
        </div>

        <div className="create-booking-modal__field">
          <AppInput
            label="Введите номер"
            placeholder="A000AA 111"
            value={licensePlate}
            onChange={(value) => setLicensePlate(value)}
          />
        </div>

        <div className="create-booking-modal__field-row">
          <div className="create-booking-modal__field">
            <AppSingleSelect
              label="Выберите марку"
              placeholder="Марка"
              options={makeOptions}
              value={selectedMake}
              onChange={setSelectedMake}
              clearable
            />
          </div>

          <div className="create-booking-modal__field">
            <AppSingleSelect
              label="Выберите модель"
              placeholder="Модель"
              options={modelOptions}
              value={selectedModel}
              onChange={setSelectedModel}
              disabled={!selectedMake || isLoadingModels}
              clearable
            />
          </div>
        </div>

        <div className="create-booking-modal__field-row">
          <div className="create-booking-modal__field">
            <AppDatePicker
              label="Дата и время"
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={new Date()}
            />
          </div>

          <div className="create-booking-modal__field create-booking-modal__field--time">
            <label className="create-booking-modal__time-label">&nbsp;</label>
            <AppTimePicker
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="09:00"
            />
          </div>
        </div>

        <div className="create-booking-modal__field">
          <AppSingleSelect
            label="Название услуги"
            placeholder="Выберите услугу"
            options={mainServiceOptions}
            value={selectedService}
            onChange={setSelectedService}
            clearable
          />
        </div>

        <div className="create-booking-modal__field">
          <AppMultiSelect
            label="Дополнительные услуги"
            placeholder="Выберите дополнительные услуги"
            options={additionalServiceOptions}
            value={selectedAdditionalServices}
            onChange={setSelectedAdditionalServices}
            clearable
          />
        </div>

        <div className="create-booking-modal__field">
          <AppInput
            label="Комментарий к заказу"
            placeholder=""
            value={comment}
            onChange={(value) => setComment(value)}
          />
        </div>
      </div>

      <div className="create-booking-modal__footer">
        <AppButton
          onClick={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Добавить
        </AppButton>
      </div>
    </div>
  );
});

export default CreateBookingModal;

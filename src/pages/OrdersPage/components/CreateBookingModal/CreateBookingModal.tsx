import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { useStores } from '@/hooks';
import { AppInput } from '@/components/ui';
import { AppSingleSelect } from '@/components/ui/AppSingleSelect';
import { AppMultiSelect } from '@/components/ui/AppMultiSelect';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import { AppButton } from '@/components/ui';
import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
import { 
  carsControllerGetMakes, 
  carsControllerGetModelsByMakeId,
  adminFindOrCreateClient,
  adminCreateOrUpdateCar,
  adminCreateBooking,
  serviceCenterGetSlots,
  adminSearchClients,
  adminSearchCars,
} from '../../../../../services/api-client';
import type { SelectOption } from '@/components/ui/AppSingleSelect/AppSingleSelect.types';
import type { SelectOption as MultiSelectOption } from '@/components/ui/AppMultiSelect/AppMultiSelect.types';
import type { SelectOption as AutocompleteOption } from '@/components/ui/AppAutocomplete/AppAutocomplete.types';
import type { ClientSearchResultDto, CarSearchResultDto } from '../../../../../services/api-client/types.gen';
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
  const [phone, setPhone] = useState(''); // Храним введенный телефон
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedMake, setSelectedMake] = useState<SelectOption | null>(null);
  const [selectedModel, setSelectedModel] = useState<SelectOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [selectedTime, setSelectedTime] = useState(initialTime || '');
  const [selectedService, setSelectedService] = useState<SelectOption | null>(null);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<MultiSelectOption[]>([]);
  const [comment, setComment] = useState('');
  
  // Client and car autocomplete state
  const [selectedClient, setSelectedClient] = useState<ClientSearchResultDto | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [selectedCar, setSelectedCar] = useState<CarSearchResultDto | null>(null);
  const [phoneAutocompleteValue, setPhoneAutocompleteValue] = useState<AutocompleteOption | undefined>();
  const [carAutocompleteValue, setCarAutocompleteValue] = useState<AutocompleteOption | undefined>();
  const [clientCarsOptions, setClientCarsOptions] = useState<AutocompleteOption[]>([]); // Опции автомобилей выбранного клиента
  
  // Data state
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available time slots state
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Ref для отслеживания первой загрузки (чтобы не очищать initialTime)
  const isFirstLoad = useRef(true);

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

  // Загрузка доступных слотов
  const loadAvailableSlots = useCallback(async () => {
    // Проверяем что есть все необходимые данные
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

      // Преобразуем ISO даты в формат "HH:mm" с интервалом в 1 час
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
  }, [selectedDate, selectedService, authStore.user, toastStore]);

  // Load services on mount
  useEffect(() => {
    if (isOpen && servicesStore.services.length === 0) {
      servicesStore.fetchServices();
    }
  }, [isOpen, servicesStore]);

  // Auto-select first main service when services are loaded
  useEffect(() => {
    if (isOpen && servicesStore.mainServices.length > 0 && !selectedService) {
      const firstService = servicesStore.mainServices[0];
      setSelectedService({
        label: firstService.name,
        value: firstService.uuid,
      });
    }
  }, [isOpen, servicesStore.mainServices, selectedService]);

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

  // Предзаполнение модели при выборе автомобиля из автокомплита
  useEffect(() => {
    if (selectedCar && models.length > 0) {
      const modelOption = models
        .filter(m => m.id && m.name)
        .map(m => ({ label: m.name!, value: m.id! }))
        .find(m => m.label === selectedCar.model);
      
      if (modelOption) {
        setSelectedModel(modelOption);
      }
    }
  }, [selectedCar, models]);

  // Load available slots when date or service changes
  useEffect(() => {
    loadAvailableSlots();
    // Очищаем выбранное время когда меняется дата или сервис
    // НО не очищаем при первой загрузке (чтобы сохранить initialTime)
    if (selectedDate && selectedService) {
      if (!isFirstLoad.current) {
        setSelectedTime('');
      } else {
        isFirstLoad.current = false;
      }
    }
  }, [loadAvailableSlots, selectedDate, selectedService]);

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

  // Функция поиска клиентов по номеру телефона
  const searchClients = useCallback(async (phoneQuery: string): Promise<AutocompleteOption[]> => {
    // Извлекаем только цифры из введенного телефона
    const digits = phoneQuery.replace(/\D/g, '');
    
    // Минимум 3 цифры для поиска (по требованиям)
    if (digits.length < 3) {
      return [];
    }

    try {
      const results = await adminSearchClients({ phone: digits, limit: 10 });
      
      return results.map((client: ClientSearchResultDto) => ({
        label: `${client.phone}${client.name ? ` (${client.name})` : ''}`,
        value: client.uuid,
        isCustom: false,
        // Сохраняем оригинальные данные для последующего использования
        rawData: client,
      } as AutocompleteOption & { rawData: ClientSearchResultDto }));
    } catch (error) {
      console.error('Failed to search clients:', error);
      toastStore.showError('Не удалось выполнить поиск клиентов');
      return [];
    }
  }, [toastStore]);

  // Обработчик выбора клиента из автокомплита
  const handleClientSelect = useCallback(async (option: AutocompleteOption) => {
    setPhoneAutocompleteValue(option);
    
    if (option.isCustom || !option.value) {
      // Пользователь ввел новый номер (не из списка)
      setSelectedClient(null);
      setClientName('');
      setClientCarsOptions([]); // Очищаем список автомобилей
      // Сохраняем введенный телефон для последующего использования
      setPhone(option.label);
      return;
    }

    // Пользователь выбрал существующего клиента
    const clientData = (option as AutocompleteOption & { rawData: ClientSearchResultDto }).rawData;
    if (clientData) {
      setSelectedClient(clientData);
      setClientName(clientData.name ? String(clientData.name) : '');
      setPhone(clientData.phone);
      
      // Сразу загружаем автомобили выбранного клиента
      try {
        const cars = await adminSearchCars({
          licensePlate: '', // Пустой запрос вернет все авто клиента
          clientUuid: clientData.uuid,
          limit: 50,
        });
        
        const carsOptions = cars.map((car: CarSearchResultDto) => ({
          label: `${car.license_plate} (${car.make} ${car.model})`,
          value: car.uuid,
          isCustom: false,
          rawData: car,
        } as AutocompleteOption & { rawData: CarSearchResultDto }));
        
        setClientCarsOptions(carsOptions);
      } catch (error) {
        console.error('Failed to load client cars:', error);
        setClientCarsOptions([]);
      }
    }
  }, []);

  // Функция поиска автомобилей по номеру
  const searchCars = useCallback(async (plateQuery: string): Promise<AutocompleteOption[]> => {
    // Минимум 2 символа для поиска (по требованиям)
    if (plateQuery.length < 2) {
      return []; // Возвращаем пустой массив, компонент покажет options
    }

    try {
      const results = await adminSearchCars({
        licensePlate: plateQuery,
        clientUuid: selectedClient?.uuid, // Фильтруем по клиенту, если выбран
        limit: 10,
      });
      
      return results.map((car: CarSearchResultDto) => ({
        label: `${car.license_plate} (${car.make} ${car.model})`,
        value: car.uuid,
        isCustom: false,
        rawData: car,
      } as AutocompleteOption & { rawData: CarSearchResultDto }));
    } catch (error) {
      console.error('Failed to search cars:', error);
      toastStore.showError('Не удалось выполнить поиск автомобилей');
      return [];
    }
  }, [selectedClient?.uuid, toastStore]);

  // Обработчик выбора автомобиля из автокомплита
  const handleCarSelect = useCallback((option: AutocompleteOption) => {
    setCarAutocompleteValue(option);
    
    if (option.isCustom || !option.value) {
      // Пользователь ввел новый номер
      setSelectedCar(null);
      setLicensePlate(option.label);
      return;
    }

    // Пользователь выбрал существующий автомобиль
    const carData = (option as AutocompleteOption & { rawData: CarSearchResultDto }).rawData;
    if (carData) {
      setSelectedCar(carData);
      setLicensePlate(carData.license_plate);
      
      // Предзаполняем марку и модель, если они еще не выбраны или если они совпадают
      const makeOption = makeOptions.find(m => m.label === carData.make);
      if (makeOption) {
        setSelectedMake(makeOption);
        
        // Модели будут загружены в useEffect
        // Установим модель после загрузки моделей через useEffect
      }
    }
  }, [makeOptions]);

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
      let clientUuid: string;
      
      // Если клиент был выбран из автокомплита - используем его UUID
      if (selectedClient) {
        clientUuid = selectedClient.uuid;
      } else {
        // Иначе создаем нового клиента
        // Нормализуем телефон: убираем все кроме цифр и добавляем +7 если нужно
        let cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('7') && cleanPhone.length === 10) {
          cleanPhone = '7' + cleanPhone;
        }
        cleanPhone = '+' + cleanPhone;
        
        const clientResponse = await adminFindOrCreateClient({
          requestBody: { phone: cleanPhone }
        });
        clientUuid = clientResponse.uuid;
      }

      let carUuid: string;
      
      // Если автомобиль был выбран из автокомплита - используем его UUID
      if (selectedCar) {
        carUuid = selectedCar.uuid;
      } else {
        // Иначе создаем новый автомобиль
        const carResponse = await adminCreateOrUpdateCar({
          clientUuid: clientUuid,
          requestBody: {
            license_plate: licensePlate,
            make: selectedMake.label,
            model: selectedModel.label,
            make_id: String(selectedMake.value),
            model_id: String(selectedModel.value),
          }
        });
        carUuid = carResponse.uuid;
      }

      // 3. Формируем дату и время начала бронирования
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      // 4. Создать бронирование
      await adminCreateBooking({
        requestBody: {
          service_center_uuid: authStore.user.service_center_uuid,
          client_uuid: clientUuid,
          car_uuid: carUuid,
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
    
    // Reset client and car autocomplete state
    setSelectedClient(null);
    setClientName('');
    setSelectedCar(null);
    setPhoneAutocompleteValue(undefined);
    setCarAutocompleteValue(undefined);
    setClientCarsOptions([]); // Очищаем список автомобилей клиента
    
    // Сбрасываем флаг первой загрузки
    isFirstLoad.current = true;
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="create-booking-modal__overlay" onClick={handleClose}>
      <div className="create-booking-modal" onClick={(e) => e.stopPropagation()}>
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
        {/* Поля телефона и имени клиента */}
        <div className="create-booking-modal__field-row">
          <div className="create-booking-modal__field">
            <AppAutocomplete
              label="Поиск по телефону"
              placeholder="+7 (999) 888-77-66"
              value={phoneAutocompleteValue}
              onSearch={searchClients}
              onChange={handleClientSelect}
              minSearchLength={3}
              searchDebounce={300}
              mask="+{7} (000) 000-00-00"
              unmask="typed"
              lazy={false}
            />
          </div>

          <div className="create-booking-modal__field">
            <AppInput
              label="Имя клиента"
              placeholder="Имя клиента"
              value={clientName}
              onChange={(value) => setClientName(value)}
            />
          </div>
        </div>

        {/* Номер автомобиля */}
        <div className="create-booking-modal__field">
          <AppAutocomplete
            label="Номер автомобиля"
            placeholder="A000AA 111"
            value={carAutocompleteValue}
            options={clientCarsOptions} // Передаем загруженные автомобили клиента
            onSearch={searchCars}
            onChange={handleCarSelect}
            minSearchLength={2}
            searchDebounce={300}
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

          <div className="create-booking-modal__field">
            <AppTimePicker
              label="Время"
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="09:00"
              availableSlots={availableTimeSlots}
              disabled={isLoadingSlots || !selectedDate || !selectedService}
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
  </div>
  );
});

export default CreateBookingModal;

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { useStores } from '@/hooks';
import { AppInput, AppTextarea } from '@/components/ui';
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
  const [phone, setPhone] = useState('+7'); // Храним введенный телефон
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
  const [phoneAutocompleteValue, setPhoneAutocompleteValue] = useState<AutocompleteOption | undefined>({ label: '+7', value: null, isCustom: true });
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
  
  // Ref для отслеживания места начала клика (для предотвращения закрытия при выделении текста)
  const mouseDownOnOverlay = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Флаг для отслеживания, были ли изменены марка/модель после автозаполнения
  const [carDetailsModified, setCarDetailsModified] = useState(false);
  // Сохраняем оригинальные значения марки/модели при автозаполнении
  const originalCarDetails = useRef<{ make: string | null; model: string | null }>({ make: null, model: null });
  
  // Флаг для однократного автовыбора услуги
  const hasAutoSelectedService = useRef(false);

  // Обновление даты и времени при открытии модального окна с новыми значениями
  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        setSelectedDate(initialDate);
      }
      if (initialTime) {
        setSelectedTime(initialTime);
      }
      // Сбрасываем флаг первой загрузки при открытии
      isFirstLoad.current = true;
      // Сбрасываем значение телефона на "+7" при открытии модального окна
      setPhone('+7');
      setPhoneAutocompleteValue({ label: '+7', value: null, isCustom: true });
    }
  }, [isOpen, initialDate, initialTime]);

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

  // Auto-select first main service when services are loaded (only once per modal open)
  useEffect(() => {
    if (isOpen) {
      // Сбрасываем флаг при открытии модального окна
      hasAutoSelectedService.current = false;
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen && servicesStore.mainServices.length > 0 && !selectedService && !hasAutoSelectedService.current) {
      const firstService = servicesStore.mainServices[0];
      setSelectedService({
        label: firstService.name,
        value: firstService.uuid,
      });
      hasAutoSelectedService.current = true;
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
      // Сбрасываем модель при смене марки
      setSelectedModel(null);
      
      // Проверяем, была ли изменена марка после автозаполнения
      if (originalCarDetails.current.make && originalCarDetails.current.make !== selectedMake.label) {
        setCarDetailsModified(true);
      }
    } else {
      setModels([]);
      setSelectedModel(null);
    }
  }, [selectedMake, loadModels]);

  // Предзаполнение модели при выборе автомобиля из автокомплита
  useEffect(() => {
    if (selectedCar && models.length > 0 && selectedMake) {
      // Проверяем, что выбранная марка соответствует марке автомобиля
      if (selectedMake.label === selectedCar.make) {
        const modelOption = models
          .filter(m => m.id && m.name && m.markId === selectedMake.value)
          .map(m => ({ label: m.name!, value: m.id! }))
          .find(m => m.label === selectedCar.model);
        
        if (modelOption) {
          setSelectedModel(modelOption);
        }
      }
    }
  }, [selectedCar, models, selectedMake]);
  
  // Отслеживание изменения модели после автозаполнения
  useEffect(() => {
    if (selectedModel && originalCarDetails.current.model && originalCarDetails.current.model !== selectedModel.label) {
      setCarDetailsModified(true);
    }
  }, [selectedModel]);

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
    return servicesStore.mainServices
      .map(service => ({
        label: service.name,
        value: service.uuid,
      }));
  }, [servicesStore.mainServices]);

  const additionalServiceOptions: MultiSelectOption[] = useMemo(() => {
    return servicesStore.additionalServices
      .map(service => ({
        label: service.name,
        value: service.uuid,
      }));
  }, [servicesStore.additionalServices]);

  // Функция поиска клиентов по номеру телефона
  const searchClients = useCallback(async (phoneQuery: string): Promise<AutocompleteOption[]> => {
    console.log('🔍 searchClients called:', { phoneQuery });
    
    // Извлекаем только цифры из введенного телефона
    const digits = phoneQuery.replace(/\D/g, '');
    
    console.log('🔍 searchClients extracted digits:', { digits, length: digits.length });
    
    // Убираем префикс "7" если он есть в начале (это код страны)
    const searchDigits = digits.startsWith('7') ? digits.substring(1) : digits;
    
    console.log('🔍 searchClients search digits (without country code):', { searchDigits, length: searchDigits.length });
    
    // Минимум 3 цифры для поиска (по требованиям)
    if (searchDigits.length < 3) {
      console.log('❌ searchClients: not enough digits, returning empty');
      return [];
    }

    try {
      console.log('📡 searchClients: calling API with:', { phone: searchDigits });
      const results = await adminSearchClients({ phone: searchDigits, limit: 10 });
      
      return results.map((client: ClientSearchResultDto) => ({
        // label для отображения в списке - с именем
        label: `${client.phone}${client.name ? ` (${client.name})` : ''}`,
        // displayLabel для инпута после выбора - только телефон
        displayLabel: client.phone,
        value: client.uuid,
        isCustom: false,
        // Сохраняем оригинальные данные для последующего использования
        rawData: client,
      } as AutocompleteOption & { rawData: ClientSearchResultDto; displayLabel?: string }));
    } catch (error) {
      console.error('Failed to search clients:', error);
      toastStore.showError('Не удалось выполнить поиск клиентов');
      return [];
    }
  }, [toastStore]);

  // Обработчик выбора клиента из автокомплита
  const handleClientSelect = useCallback(async (option: AutocompleteOption) => {
    console.log('👤 handleClientSelect called:', { option });
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
    console.log('👤 handleClientSelect clientData:', { clientData, hasRawData: !!clientData });
    
    if (clientData) {
      console.log('👤 Setting client name to:', clientData.name);
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
          label: car.license_plate,
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
        label: car.license_plate,
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
      
      // Сохраняем оригинальные значения для отслеживания изменений
      originalCarDetails.current = {
        make: carData.make,
        model: carData.model,
      };
      setCarDetailsModified(false);
      
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

    // Проверка что выбранная дата и время не в прошлом
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    if (bookingDateTime < new Date()) {
      toastStore.showError('Нельзя создать запись на прошедшее время');
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
      
      // Если автомобиль был выбран из автокомплита И марка/модель НЕ были изменены - используем его UUID
      // Иначе создаем новый автомобиль (даже если номер уже есть в базе)
      if (selectedCar && !carDetailsModified) {
        carUuid = selectedCar.uuid;
      } else {
        // Создаем новый автомобиль
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

  const handleClose = useCallback(() => {
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
    
    // Сбрасываем флаги отслеживания изменений автомобиля
    setCarDetailsModified(false);
    originalCarDetails.current = { make: null, model: null };
    
    onClose();
  }, [initialDate, initialTime, onClose]);

  // Проверяем, была ли форма изменена
  const isFormDirty = useCallback(() => {
    // Проверяем, есть ли изменения в форме относительно начального состояния
    const hasPhoneChange = phone !== '+7' && phone !== '';
    const hasLicensePlate = licensePlate.trim() !== '';
    const hasClientName = clientName.trim() !== '';
    const hasComment = comment.trim() !== '';
    const hasAdditionalServices = selectedAdditionalServices.length > 0;
    
    return hasPhoneChange || hasLicensePlate || hasClientName || hasComment || hasAdditionalServices;
  }, [phone, licensePlate, clientName, comment, selectedAdditionalServices]);

  // Обработчик закрытия с подтверждением
  const handleCloseWithConfirmation = useCallback(() => {
    if (isFormDirty()) {
      if (window.confirm('Вы уверены, что хотите закрыть окно? Все несохранённые данные будут потеряны.')) {
        handleClose();
      }
    } else {
      handleClose();
    }
  }, [isFormDirty, handleClose]);

  // Обработчики для корректного закрытия по клику на overlay
  // (закрываем только если и mousedown и mouseup произошли на overlay)
  const handleOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      mouseDownOnOverlay.current = true;
    }
  }, []);

  const handleOverlayMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current && mouseDownOnOverlay.current) {
      handleCloseWithConfirmation();
    }
    mouseDownOnOverlay.current = false;
  }, [handleCloseWithConfirmation]);

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="create-booking-modal__overlay" 
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div className="create-booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-booking-modal__header">
          <h2 className="create-booking-modal__title">Добавление записи</h2>
          <button 
            className="create-booking-modal__close" 
            onClick={handleCloseWithConfirmation} 
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
              label="Номер телефона"
              placeholder="+7"
              value={phoneAutocompleteValue}
              onSearch={searchClients}
              onChange={handleClientSelect}
              minSearchLength={3}
              searchDebounce={300}
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
            renderOption={(option) => {
              const carData = (option as AutocompleteOption & { rawData?: CarSearchResultDto }).rawData;
              if (carData?.make && carData?.model) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', pointerEvents: 'none' }}>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{carData.make} {carData.model}</div>
                  </div>
                );
              }
              return option.label;
            }}
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
              minDate={new Date(new Date().setHours(0, 0, 0, 0))}
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
            multiline
          />
        </div>

        <div className="create-booking-modal__field">
          <AppTextarea
            label="Комментарий к заказу"
            placeholder="Введите комментарий"
            value={comment}
            onChange={(value) => setComment(value)}
            minRows={2}
            maxRows={10}
            autoResize
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

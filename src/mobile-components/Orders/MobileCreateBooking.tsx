import { useState, useEffect, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useStores } from '@/hooks';
import { AppInput, AppButton, AppTextarea } from '@/components/ui';
import { AppSingleSelect } from '@/components/ui/AppSingleSelect';
import { AppMultiSelect } from '@/components/ui/AppMultiSelect';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import type { SelectOption } from '@/components/ui/AppSingleSelect/AppSingleSelect.types';
import type { SelectOption as MultiSelectOption } from '@/components/ui/AppMultiSelect/AppMultiSelect.types';
import type { SelectOption as AutocompleteOption } from '@/components/ui/AppAutocomplete/AppAutocomplete.types';
import type { ClientSearchResultDto, CarSearchResultDto } from '../../../services/api-client/types.gen';
import { 
  carsControllerGetMakes,
  carsControllerGetModelsByMakeId,
  adminFindOrCreateClient,
  adminCreateOrUpdateCar,
  adminCreateBooking,
  serviceCenterGetSlots,
  adminSearchClients,
  adminSearchCars,
} from '../../../services/api-client';
import './MobileCreateBooking.css';

// Иконка часов для поля времени
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M10 5V10L13 13M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" 
      stroke="#B2B1AE" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

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
  markId?: string;
}

export const MobileCreateBooking = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { servicesStore, toastStore, authStore } = useStores();
  
  const locationState = location.state as LocationState | null;
  
  // Получаем параметры из URL query
  const searchParams = new URLSearchParams(location.search);
  const dateParam = searchParams.get('date'); // format: 'yyyy-MM-dd'
  const timeParam = searchParams.get('time'); // format: 'HH:mm'
  
  // Определяем начальную дату и время из URL параметров или location state
  const getInitialDate = (): Date | null => {
    if (dateParam) {
      return new Date(dateParam);
    }
    if (locationState?.initialDate) {
      return new Date(locationState.initialDate);
    }
    return null;
  };
  
  const getInitialTime = (): string => {
    if (timeParam) {
      return timeParam;
    }
    if (locationState?.initialTime) {
      return locationState.initialTime;
    }
    return '';
  };

  // Form state
  const [phone, setPhone] = useState(''); // Храним введенный телефон
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedMake, setSelectedMake] = useState<SelectOption | null>(null);
  const [selectedModel, setSelectedModel] = useState<SelectOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(getInitialDate());
  const [selectedTime, setSelectedTime] = useState(getInitialTime());
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

  const mainServiceOptions: SelectOption[] = servicesStore.mainServices
    .map(service => ({
      label: service.name,
      value: service.uuid,
    }));

  const additionalServiceOptions: MultiSelectOption[] = servicesStore.additionalServices
    .map(service => ({
      label: service.name,
      value: service.uuid,
    }));

  // Функция поиска клиентов по номеру телефона
  const searchClients = useCallback(async (phoneQuery: string): Promise<AutocompleteOption[]> => {
    const digits = phoneQuery.replace(/\D/g, '');
    const searchDigits = digits.startsWith('7') ? digits.substring(1) : digits;
    
    if (searchDigits.length < 3) {
      return [];
    }

    try {
      const results = await adminSearchClients({ phone: searchDigits, limit: 10 });
      
      return results.map((client: ClientSearchResultDto) => ({
        label: `${client.phone}${client.name ? ` (${client.name})` : ''}`,
        value: client.uuid,
        isCustom: false,
      } as AutocompleteOption));
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
      setSelectedClient(null);
      setClientName('');
      setClientCarsOptions([]);
      setPhone(option.label);
      return;
    }

    // Ищем клиента в результатах поиска
    try {
      const phoneDigits = option.label.replace(/\D/g, '');
      const searchDigits = phoneDigits.startsWith('7') ? phoneDigits.substring(1) : phoneDigits;
      const clients = await adminSearchClients({ phone: searchDigits, limit: 1 });
      
      if (clients.length > 0) {
        const clientData = clients[0];
        setSelectedClient(clientData);
        setClientName(clientData.name ? String(clientData.name) : '');
        setPhone(clientData.phone);
        
        // Загружаем автомобили выбранного клиента
        const cars = await adminSearchCars({
          licensePlate: '',
          clientUuid: clientData.uuid,
          limit: 50,
        });
        
        const carsOptions: AutocompleteOption[] = cars.map((car: CarSearchResultDto) => ({
          label: car.license_plate,
          value: car.uuid,
          isCustom: false,
          rawData: car,
        } as AutocompleteOption & { rawData: CarSearchResultDto }));
        
        setClientCarsOptions(carsOptions);
      }
    } catch (error) {
      console.error('Failed to load client data:', error);
      setClientCarsOptions([]);
    }
  }, []);

  // Функция поиска автомобилей по номеру
  const searchCars = useCallback(async (plateQuery: string): Promise<AutocompleteOption[]> => {
    if (plateQuery.length < 2) {
      return [];
    }

    try {
      const results = await adminSearchCars({
        licensePlate: plateQuery,
        clientUuid: selectedClient?.uuid,
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
  const handleCarSelect = useCallback(async (option: AutocompleteOption) => {
    setCarAutocompleteValue(option);
    
    if (option.isCustom || !option.value) {
      setSelectedCar(null);
      setLicensePlate(option.label);
      return;
    }

    // Ищем автомобиль в результатах поиска
    try {
      const cars = await adminSearchCars({
        licensePlate: option.label,
        clientUuid: selectedClient?.uuid,
        limit: 1,
      });
      
      if (cars.length > 0) {
        const carData = cars[0];
        setSelectedCar(carData);
        setLicensePlate(carData.license_plate);
        
        const makeOption = makeOptions.find(m => m.label === carData.make);
        if (makeOption) {
          setSelectedMake(makeOption);
        }
      }
    } catch (error) {
      console.error('Failed to load car data:', error);
    }
  }, [selectedClient?.uuid, makeOptions]);

  // Предзаполнение модели при выборе автомобиля
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

  // Вычисление общей стоимости
  const totalCost = useMemo(() => {
    let cost = 0;
    
    if (selectedService) {
      const service = servicesStore.services.find(s => s.uuid === selectedService.value);
      if (service) {
        cost += service.price || 0;
      }
    }
    
    if (selectedAdditionalServices.length > 0) {
      selectedAdditionalServices.forEach(additionalService => {
        const service = servicesStore.services.find(s => s.uuid === additionalService.value);
        if (service) {
          cost += service.price || 0;
        }
      });
    }
    
    return cost;
  }, [selectedService, selectedAdditionalServices, servicesStore.services]);

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

    // Проверка что выбранная дата и время не в прошлом
    const [checkHours, checkMinutes] = selectedTime.split(':').map(Number);
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(checkHours, checkMinutes, 0, 0);
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

      const additionalServiceUuids = selectedAdditionalServices.length > 0
        ? selectedAdditionalServices.map(service => String(service.value))
        : [];

      await adminCreateBooking({
        requestBody: {
          service_center_uuid: authStore.user.service_center_uuid,
          client_uuid: clientResponse.uuid,
          car_uuid: carResponse.uuid,
          service_uuid: String(selectedService.value),
          start_time: startTime.toISOString(),
          payment_method: 'cash',
          additional_service_uuids: additionalServiceUuids,
          admin_comment: comment || undefined,
        }
      });

      toastStore.showSuccess('Запись успешно создана');
      
      // Navigate back to orders page
      navigate('/orders');
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
        </button>
        <h1 className="mobile-create-booking__title">Добавление записи</h1>
      </div>

      <div className="mobile-create-booking__content">
        <div className="mobile-create-booking__field">
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

        <div className="mobile-create-booking__field">
          <AppInput
            label="Имя клиента"
            placeholder="Имя"
            value={clientName}
            onChange={setClientName}
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppAutocomplete
            label="Введите номер"
            placeholder="A000AA 111"
            value={carAutocompleteValue}
            onSearch={searchCars}
            onChange={handleCarSelect}
            options={clientCarsOptions}
            minSearchLength={2}
            searchDebounce={300}
            renderOption={(option) => {
              const carData = (option as AutocompleteOption & { rawData?: CarSearchResultDto }).rawData;
              if (carData?.make && carData?.model) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: '13px', lineHeight: 1, color: '#666' }}>{carData.make} {carData.model}</div>
                  </div>
                );
              }
              return option.label;
            }}
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppSingleSelect
            label="Выберите марку"
            placeholder="Марка"
            options={makeOptions}
            value={selectedMake}
            onChange={setSelectedMake}
            clearable
          />
        </div>

        <div className="mobile-create-booking__field">
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

        <div className="mobile-create-booking__date-time-section">
          <div className="mobile-create-booking__date-field">
            <AppDatePicker
              label="Дата и время"
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={new Date()}
            />
          </div>

          <div className="mobile-create-booking__time-field">
            <AppTimePicker
              label=" "
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="09:00"
              availableSlots={availableTimeSlots}
              disabled={isLoadingSlots || !selectedDate || !selectedService}
              iconLeft={<ClockIcon />}
            />
          </div>
        </div>

        <div className="mobile-create-booking__field">
          <AppSingleSelect
            label="Название услуги"
            placeholder="Выберите услугу"
            options={mainServiceOptions}
            value={selectedService}
            onChange={setSelectedService}
            clearable
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppMultiSelect
            label="Дополнительные услуги"
            placeholder="Выберите дополнительные услуги"
            options={additionalServiceOptions}
            value={selectedAdditionalServices}
            onChange={setSelectedAdditionalServices}
            multiline
          />
        </div>

        <div className="mobile-create-booking__field">
          <AppTextarea
            label="Комментарий к заказу"
            placeholder="Введите комментарий"
            value={comment}
            onChange={setComment}
            minRows={2}
            maxRows={10}
            autoResize
          />
        </div>
      </div>

      <div className="mobile-create-booking__footer">
        <AppButton
          onClick={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {totalCost > 0 ? `Создать заказ ${totalCost}₽` : 'Создать заказ'}
        </AppButton>
      </div>
    </div>
  );
});

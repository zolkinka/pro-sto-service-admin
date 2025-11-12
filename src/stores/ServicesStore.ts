import { makeAutoObservable, runInAction } from 'mobx';
import type { ServiceDto, CreateServiceDto, UpdateServiceDto } from '../../services/api-client';
import { 
  adminServicesGetAll, 
  adminServicesDelete,
  adminServicesCreate,
  adminServicesUpdate,
} from '../../services/api-client';
import { toastStore } from './ToastStore';

/**
 * Данные формы для создания/редактирования услуги
 */
export interface ServiceFormData {
  name: string;
  description: string;
  duration: string;
  priceSedan: string;
  priceCrossover: string;
  priceSuv: string;
  priceMinivan: string;
}

/**
 * Store для управления услугами сервиса
 * Управляет загрузкой, фильтрацией и удалением услуг
 */
export class ServicesStore {
  services: ServiceDto[] = [];
  activeCategory: 'car_wash' | 'tire_service' = 'car_wash';
  isLoading = false;
  error: string | null = null;
  
  // Состояние формы создания/редактирования
  formData: ServiceFormData = {
    name: '',
    description: '',
    duration: '',
    priceSedan: '',
    priceCrossover: '',
    priceSuv: '',
    priceMinivan: '',
  };
  
  formErrors: Record<string, string> = {};
  isSubmitting = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Загрузка услуг с API
   */
  async fetchServices() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await adminServicesGetAll({
        businessType: this.activeCategory,
      });

      runInAction(() => {
        // Приводим тип Service к ServiceDto
        this.services = response as unknown as ServiceDto[];
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки услуг';
        this.isLoading = false;
      });
      console.error('Ошибка при загрузке услуг:', error);
      toastStore.showError('Не удалось загрузить услуги');
    }
  }

  /**
   * Установка активной категории и перезагрузка услуг
   */
  setActiveCategory(category: 'car_wash' | 'tire_service') {
    this.activeCategory = category;
    this.fetchServices();
  }

  /**
   * Удаление услуги
   */
  async deleteService(uuid: string): Promise<boolean> {
    try {
      await adminServicesDelete({ uuid });

      runInAction(() => {
        this.services = this.services.filter((s) => s.uuid !== uuid);
      });

      toastStore.showSuccess('Услуга успешно удалена');
      return true;
    } catch (error) {
      console.error('Ошибка при удалении услуги:', error);
      toastStore.showError('Не удалось удалить услугу');
      return false;
    }
  }

  /**
   * Геттер для основных услуг текущей категории
   */
  get mainServices(): ServiceDto[] {
    return this.services.filter(
      (s) => s.service_type === 'main' && s.business_type === this.activeCategory
    );
  }

  /**
   * Геттер для дополнительных услуг текущей категории
   */
  get additionalServices(): ServiceDto[] {
    return this.services.filter(
      (s) => s.service_type === 'additional' && s.business_type === this.activeCategory
    );
  }

  /**
   * Создание новой услуги
   */
  async createService(serviceData: CreateServiceDto): Promise<boolean> {
    try {
      const response = await adminServicesCreate({
        requestBody: serviceData,
      });

      runInAction(() => {
        // Добавляем новую услугу в список
        this.services.push(response as unknown as ServiceDto);
      });

      toastStore.showSuccess('Услуга успешно создана');
      return true;
    } catch (error) {
      console.error('Ошибка при создании услуги:', error);
      toastStore.showError('Не удалось создать услугу');
      return false;
    }
  }

  /**
   * Обновление существующей услуги
   */
  async updateService(uuid: string, serviceData: UpdateServiceDto): Promise<boolean> {
    try {
      const response = await adminServicesUpdate({
        uuid,
        requestBody: serviceData,
      });

      runInAction(() => {
        // Обновляем услугу в списке
        const index = this.services.findIndex((s) => s.uuid === uuid);
        if (index !== -1) {
          this.services[index] = response as unknown as ServiceDto;
        }
      });

      toastStore.showSuccess('Услуга успешно обновлена');
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении услуги:', error);
      toastStore.showError('Не удалось обновить услугу');
      return false;
    }
  }

  /**
   * Преобразование данных услуги в формат формы
   */
  serviceToFormData(service: ServiceDto): ServiceFormData {
    const getPriceByClass = (carClass: string): string => {
      const priceItem = service.servicePrices?.find(
        (p) => p.parameter_value === carClass && p.parameter_type === 'simple_car_class'
      );
      return priceItem?.price?.toString() || '';
    };

    return {
      name: service.name || '',
      description: service.description || '',
      duration: service.duration_minutes?.toString() || '',
      priceSedan: getPriceByClass('sedan'),
      priceCrossover: getPriceByClass('crossover'),
      priceSuv: getPriceByClass('suv'),
      priceMinivan: getPriceByClass('minivan'),
    };
  }

  /**
   * Преобразование данных формы в формат API для создания/обновления
   * @param formData - данные формы
   * @param serviceType - тип услуги (основная/дополнительная)
   * @param serviceCenterUuid - UUID сервисного центра (только для создания)
   */
  formDataToServiceDto(
    formData: ServiceFormData, 
    serviceType: 'main' | 'additional',
    serviceCenterUuid?: string
  ): CreateServiceDto | UpdateServiceDto {
    const baseData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      duration_minutes: parseInt(formData.duration, 10),
      category: 'standard',
      business_type: this.activeCategory,
      service_type: serviceType,
      servicePrices: [
        {
          parameter_type: 'simple_car_class' as const,
          parameter_value: 'sedan',
          price: parseInt(formData.priceSedan, 10),
          is_active: true,
        },
        {
          parameter_type: 'simple_car_class' as const,
          parameter_value: 'crossover',
          price: parseInt(formData.priceCrossover, 10),
          is_active: true,
        },
        {
          parameter_type: 'simple_car_class' as const,
          parameter_value: 'suv',
          price: parseInt(formData.priceSuv, 10),
          is_active: true,
        },
        {
          parameter_type: 'simple_car_class' as const,
          parameter_value: 'minivan',
          price: parseInt(formData.priceMinivan, 10),
          is_active: true,
        },
      ],
    };

    // Добавляем service_center_uuid только при создании
    if (serviceCenterUuid) {
      return {
        ...baseData,
        service_center_uuid: serviceCenterUuid,
      } as CreateServiceDto;
    }

    return baseData as UpdateServiceDto;
  }

  /**
   * Валидация данных формы
   */
  validateFormData(formData: ServiceFormData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Название обязательно';
    }

    const duration = parseInt(formData.duration, 10);
    if (!formData.duration || isNaN(duration) || duration <= 0) {
      errors.duration = 'Укажите продолжительность (больше 0)';
    }

    // Валидация цен
    const priceFields: Array<keyof ServiceFormData> = [
      'priceSedan', 
      'priceCrossover', 
      'priceSuv', 
      'priceMinivan'
    ];
    
    priceFields.forEach((field) => {
      const price = parseInt(formData[field], 10);
      if (!formData[field] || isNaN(price) || price < 0) {
        errors[field] = 'Укажите корректную цену';
      }
    });

    return errors;
  }

  /**
   * Инициализация формы для создания новой услуги
   */
  initCreateForm() {
    this.formData = {
      name: '',
      description: '',
      duration: '',
      priceSedan: '',
      priceCrossover: '',
      priceSuv: '',
      priceMinivan: '',
    };
    this.formErrors = {};
    this.isSubmitting = false;
  }

  /**
   * Инициализация формы для редактирования услуги
   */
  initEditForm(service: ServiceDto) {
    this.formData = this.serviceToFormData(service);
    this.formErrors = {};
    this.isSubmitting = false;
  }

  /**
   * Обновление поля формы
   */
  updateFormField(field: keyof ServiceFormData, value: string) {
    this.formData[field] = value;
    
    // Очищаем ошибку при вводе
    if (this.formErrors[field]) {
      delete this.formErrors[field];
    }
  }

  /**
   * Валидация текущих данных формы и установка ошибок
   */
  validateCurrentForm(): boolean {
    this.formErrors = this.validateFormData(this.formData);
    return Object.keys(this.formErrors).length === 0;
  }

  /**
   * Сброс формы
   */
  resetForm() {
    this.formData = {
      name: '',
      description: '',
      duration: '',
      priceSedan: '',
      priceCrossover: '',
      priceSuv: '',
      priceMinivan: '',
    };
    this.formErrors = {};
    this.isSubmitting = false;
  }

  /**
   * Отправка формы (создание или обновление услуги)
   */
  async submitServiceForm(
    mode: 'create' | 'edit',
    serviceCenterUuid: string,
    serviceType: 'main' | 'additional',
    serviceUuid?: string
  ): Promise<boolean> {
    if (!this.validateCurrentForm()) {
      return false;
    }

    this.isSubmitting = true;

    try {
      let success = false;
      if (mode === 'create') {
        // При создании передаём serviceCenterUuid
        const serviceData = this.formDataToServiceDto(
          this.formData,
          serviceType,
          serviceCenterUuid
        ) as CreateServiceDto;
        success = await this.createService(serviceData);
      } else if (mode === 'edit' && serviceUuid) {
        // При редактировании НЕ передаём serviceCenterUuid
        const serviceData = this.formDataToServiceDto(
          this.formData,
          serviceType
        ) as UpdateServiceDto;
        success = await this.updateService(serviceUuid, serviceData);
      }

      if (success) {
        this.resetForm();
      }

      return success;
    } catch (error) {
      console.error('Error submitting service:', error);
      return false;
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  }
}

// Экспортируем singleton instance
export const servicesStore = new ServicesStore();

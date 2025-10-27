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
 * Store для управления услугами сервиса
 * Управляет загрузкой, фильтрацией и удалением услуг
 */
export class ServicesStore {
  services: ServiceDto[] = [];
  activeCategory: 'car_wash' | 'tire_service' = 'car_wash';
  isLoading = false;
  error: string | null = null;

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
}

// Экспортируем singleton instance
export const servicesStore = new ServicesStore();

import { makeAutoObservable, runInAction } from 'mobx';
import type { ServiceDto } from '../../services/api-client';
import { adminServicesGetAll, adminServicesDelete } from '../../services/api-client';
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
}

// Экспортируем singleton instance
export const servicesStore = new ServicesStore();

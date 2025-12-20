import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';
import { 
  operatingHoursGetAll, 
  operatingHoursUpdateRegular,
  operatingHoursCreateSpecial,
  operatingHoursDelete,
  ApiError
} from '../../services/api-client';
import type { 
  OperatingHoursResponseDto, 
  UpdateRegularScheduleDto,
  CreateSpecialDateDto
} from '../../services/api-client/types.gen';

/**
 * Извлекает человекочитаемое сообщение об ошибке из ApiError
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    // Проверяем наличие message в body
    if (error.body && typeof error.body === 'object' && 'message' in error.body) {
      const message = (error.body as { message?: string }).message;
      if (typeof message === 'string' && message.length > 0) {
        return message;
      }
    }
  }
  return 'Произошла ошибка';
};

interface OperationOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  silent?: boolean;
  forceRefresh?: boolean;
}

interface CacheEntry {
  regular: OperatingHoursResponseDto[];
  special: OperatingHoursResponseDto[];
  timezone: string;
  timestamp: number;
}

export class OperatingHoursStore {
  regularSchedule: OperatingHoursResponseDto[] = [];
  specialDates: OperatingHoursResponseDto[] = [];
  timezone: string = 'Europe/Moscow'; // Default timezone
  loading = false;
  error: string | null = null;
  private rootStore?: RootStore;
  // Защита от race condition - отслеживаем последний запрос
  private fetchRequestId = 0;
  // LRU кеш для минимизации запросов к API
  // Размер: 1 элемент (обычно работаем с одним serviceCenterUuid)
  private readonly MAX_CACHE_SIZE = 1;
  private cache = new Map<string, CacheEntry>();

  constructor(rootStore?: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  
  setRootStore(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  /**
   * Очищает кеш расписания
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Загружает расписание работы из API или кеша
   * @param serviceCenterUuid - UUID сервисного центра
   * @param options - опции загрузки
   */
  async loadOperatingHours(
    serviceCenterUuid: string,
    options: Pick<OperationOptions, 'silent' | 'forceRefresh'> = {}
  ) {
    const { silent = false, forceRefresh = false } = options;

    // Проверяем кеш, если не требуется принудительное обновление
    if (!forceRefresh) {
      const cached = this.cache.get(serviceCenterUuid);
      if (cached) {
        runInAction(() => {
          this.regularSchedule = cached.regular;
          this.specialDates = cached.special;
          this.timezone = cached.timezone;
          if (!silent) {
            this.loading = false;
            this.error = null;
          }
        });
        return;
      }
    }

    if (!silent) {
      runInAction(() => {
        this.loading = true;
        this.error = null;
      });
    }

    // Race condition protection: генерируем уникальный ID запроса
    const currentRequestId = ++this.fetchRequestId;
    
    try {
      const data = await operatingHoursGetAll({ serviceCenterUuid });

      // Проверяем, что это последний запрос
      if (currentRequestId !== this.fetchRequestId) {
        return; // Более новый запрос уже выполняется
      }
      
      runInAction(() => {
        this.regularSchedule = data.regular;
        this.specialDates = data.special;
        // Сохраняем timezone из первого элемента (все дни имеют одинаковый timezone)
        if (data.regular.length > 0) {
          this.timezone = data.regular[0].timezone;
        }
        
        // Сохраняем в кеш с LRU логикой
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
          // Удаляем самый старый элемент (первый в Map)
          const firstKey = this.cache.keys().next().value;
          if (firstKey) {
            this.cache.delete(firstKey);
          }
        }
        
        this.cache.set(serviceCenterUuid, {
          regular: data.regular,
          special: data.special,
          timezone: data.regular.length > 0 ? data.regular[0].timezone : this.timezone,
          timestamp: Date.now()
        });
        
        if (!silent) {
          this.loading = false;
        }
      });
    } catch (error) {
      // Проверяем, что это последний запрос
      if (currentRequestId !== this.fetchRequestId) {
        return;
      }

      runInAction(() => {
        this.error = 'Ошибка загрузки расписания';
        if (!silent) {
          this.loading = false;
        }
      });
      console.error('Error loading operating hours:', error);
      throw error;
    }
  }

  async updateRegularSchedule(
    serviceCenterUuid: string, 
    data: UpdateRegularScheduleDto,
    options: OperationOptions = {}
  ) {
    const { showSuccessToast = true, showErrorToast = true } = options;
    this.loading = true;
    this.error = null;
    
    try {
      await operatingHoursUpdateRegular({ 
        serviceCenterUuid, 
        requestBody: data 
      });
      
      // Инвалидируем кеш перед перезагрузкой
      this.cache.delete(serviceCenterUuid);
      
      // Показываем toast с успехом только если указано
      if (showSuccessToast) {
        this.rootStore?.toastStore.showSuccess('Расписание успешно обновлено');
      }
      
      // Перезагружаем данные после обновления с forceRefresh
      try {
        await this.loadOperatingHours(serviceCenterUuid, { forceRefresh: true });
      } catch (reloadError) {
        // Не бросаем ошибку, если перезагрузка не удалась - данные уже сохранены
        console.error('Error reloading operating hours after update:', reloadError);
      }
      
      runInAction(() => {
        this.loading = false;
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      runInAction(() => {
        this.error = errorMessage;
        this.loading = false;
      });
      
      if (showErrorToast) {
        this.rootStore?.toastStore.showError(errorMessage);
      }
      
      console.error('Error updating regular schedule:', error);
      throw error;
    }
  }

  async createSpecialDate(
    serviceCenterUuid: string, 
    data: CreateSpecialDateDto,
    options: OperationOptions = {}
  ) {
    const { showSuccessToast = true, showErrorToast = true } = options;
    this.loading = true;
    this.error = null;
    
    try {
      await operatingHoursCreateSpecial({ 
        serviceCenterUuid, 
        requestBody: data 
      });
      
      // Инвалидируем кеш перед перезагрузкой
      this.cache.delete(serviceCenterUuid);
      
      if (showSuccessToast) {
        this.rootStore?.toastStore.showSuccess('Выходной день добавлен');
      }
      
      // Перезагружаем данные после добавления с обработкой ошибки
      try {
        await this.loadOperatingHours(serviceCenterUuid, { forceRefresh: true });
      } catch (reloadError) {
        // Не бросаем ошибку, если перезагрузка не удалась - данные уже сохранены
        console.error('Error reloading operating hours after create:', reloadError);
      }
      
      runInAction(() => {
        this.loading = false;
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      runInAction(() => {
        this.error = errorMessage;
        this.loading = false;
      });
      
      if (showErrorToast) {
        this.rootStore?.toastStore.showError(errorMessage);
      }
      
      console.error('Error creating special date:', error);
      throw error;
    }
  }

  async deleteSpecialDate(
    serviceCenterUuid: string, 
    uuid: string,
    options: OperationOptions = {}
  ) {
    const { showSuccessToast = true, showErrorToast = true } = options;
    this.loading = true;
    this.error = null;
    
    try {
      await operatingHoursDelete({ 
        serviceCenterUuid, 
        uuid 
      });
      
      // Инвалидируем кеш перед перезагрузкой
      this.cache.delete(serviceCenterUuid);
      
      if (showSuccessToast) {
        this.rootStore?.toastStore.showSuccess('Выходной день удален');
      }
      
      // Перезагружаем данные после удаления с обработкой ошибки
      try {
        await this.loadOperatingHours(serviceCenterUuid, { forceRefresh: true });
      } catch (reloadError) {
        // Не бросаем ошибку, если перезагрузка не удалась - данные уже сохранены
        console.error('Error reloading operating hours after delete:', reloadError);
      }
      
      runInAction(() => {
        this.loading = false;
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      
      runInAction(() => {
        this.error = errorMessage;
        this.loading = false;
      });
      
      if (showErrorToast) {
        this.rootStore?.toastStore.showError(errorMessage);
      }
      
      console.error('Error deleting special date:', error);
      throw error;
    }
  }

  reset() {
    this.regularSchedule = [];
    this.specialDates = [];
    this.timezone = 'Europe/Moscow';
    this.loading = false;
    this.error = null;
    this.fetchRequestId = 0;
    this.cache.clear();
  }
}

// Создаем singleton instance без RootStore
// RootStore будет установлен позже через setRootStore
export const operatingHoursStore = new OperatingHoursStore();

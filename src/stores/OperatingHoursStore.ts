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
}

export class OperatingHoursStore {
  regularSchedule: OperatingHoursResponseDto[] = [];
  specialDates: OperatingHoursResponseDto[] = [];
  timezone: string = 'Europe/Moscow'; // Default timezone
  loading = false;
  error: string | null = null;
  private rootStore?: RootStore;

  constructor(rootStore?: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  
  setRootStore(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  async loadOperatingHours(serviceCenterUuid: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const data = await operatingHoursGetAll({ serviceCenterUuid });
      
      runInAction(() => {
        this.regularSchedule = data.regular;
        this.specialDates = data.special;
        // Сохраняем timezone из первого элемента (все дни имеют одинаковый timezone)
        if (data.regular.length > 0) {
          this.timezone = data.regular[0].timezone;
        }
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки расписания';
        this.loading = false;
      });
      console.error('Error loading operating hours:', error);
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
      
      // Показываем toast с успехом только если указано
      if (showSuccessToast) {
        this.rootStore?.toastStore.showSuccess('Расписание успешно обновлено');
      }
      
      // Перезагружаем данные после обновления
      try {
        await this.loadOperatingHours(serviceCenterUuid);
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
      
      if (showSuccessToast) {
        this.rootStore?.toastStore.showSuccess('Выходной день добавлен');
      }
      
      // Перезагружаем данные после добавления
      await this.loadOperatingHours(serviceCenterUuid);
      
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
      
      if (showSuccessToast) {
        this.rootStore?.toastStore.showSuccess('Выходной день удален');
      }
      
      // Перезагружаем данные после удаления
      await this.loadOperatingHours(serviceCenterUuid);
      
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
  }
}

// Создаем singleton instance без RootStore
// RootStore будет установлен позже через setRootStore
export const operatingHoursStore = new OperatingHoursStore();

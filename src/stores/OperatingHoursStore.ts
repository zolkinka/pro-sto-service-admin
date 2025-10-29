import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';
import { operatingHoursGetAll, operatingHoursUpdateRegular } from '../../services/api-client';
import type { 
  OperatingHoursResponseDto, 
  UpdateRegularScheduleDto 
} from '../../services/api-client/types.gen';

export class OperatingHoursStore {
  regularSchedule: OperatingHoursResponseDto[] = [];
  specialDates: OperatingHoursResponseDto[] = [];
  timezone: string = 'Europe/Moscow'; // Default timezone
  loading = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
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

  async updateRegularSchedule(serviceCenterUuid: string, data: UpdateRegularScheduleDto) {
    this.loading = true;
    this.error = null;
    
    try {
      await operatingHoursUpdateRegular({ 
        serviceCenterUuid, 
        requestBody: data 
      });
      
      // Показываем toast с успехом
      this.rootStore.toastStore.showSuccess('Расписание успешно обновлено');
      
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
      runInAction(() => {
        this.error = 'Ошибка сохранения расписания';
        this.loading = false;
      });
      
      this.rootStore.toastStore.showError('Не удалось сохранить расписание');
      
      console.error('Error updating regular schedule:', error);
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

// Создаем singleton instance
export const operatingHoursStore = new OperatingHoursStore({} as RootStore);

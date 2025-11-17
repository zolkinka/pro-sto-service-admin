import { makeAutoObservable, runInAction } from 'mobx';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  addWeeks, 
  addMonths,
  subWeeks,
  subMonths
} from 'date-fns';
import { ru } from 'date-fns/locale';
import type {
  AnalyticsStatsResponseDto,
  TopServiceDto,
  AnalyticsLoadChartResponseDto,
} from '../../services/api-client';
import {
  adminAnalyticsGetStats,
  adminAnalyticsGetTopServices,
  adminAnalyticsGetLoadChart,
} from '../../services/api-client';
import { toastStore } from './ToastStore';

/**
 * Тип периода для аналитики
 */
export type PeriodType = 'month' | 'week';

/**
 * Store для управления состоянием страницы аналитики
 * Управляет загрузкой статистики, топ услуг и данных графика загрузки
 */
export class AnalyticsStore {
  // Выбранный период
  periodType: PeriodType = 'month';
  
  // Текущая дата
  currentDate: Date = new Date();
  
  // Статистика
  stats: AnalyticsStatsResponseDto | null = null;
  
  // Топ услуги
  topServices: TopServiceDto[] = [];
  
  // Данные графика загрузки
  loadChartData: AnalyticsLoadChartResponseDto | null = null;
  
  // Состояние загрузки
  isLoading = false;
  
  // Ошибки
  error: string | null = null;
  
  // UUID текущего сервисного центра (из профиля админа)
  serviceCenterUuid: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Установка UUID сервисного центра
   */
  setServiceCenterUuid(uuid: string) {
    this.serviceCenterUuid = uuid;
  }

  /**
   * Изменить период
   */
  setPeriodType(type: PeriodType) {
    this.periodType = type;
  }

  /**
   * Установить дату
   */
  setCurrentDate(date: Date) {
    this.currentDate = date;
  }

  /**
   * Переход к предыдущему периоду
   */
  navigateToPreviousPeriod() {
    if (this.periodType === 'month') {
      this.currentDate = subMonths(this.currentDate, 1);
    } else {
      this.currentDate = subWeeks(this.currentDate, 1);
    }
  }

  /**
   * Переход к следующему периоду
   */
  navigateToNextPeriod() {
    if (this.periodType === 'month') {
      this.currentDate = addMonths(this.currentDate, 1);
    } else {
      this.currentDate = addWeeks(this.currentDate, 1);
    }
  }

  /**
   * Computed: начало периода
   */
  get dateFrom(): Date {
    if (this.periodType === 'month') {
      return startOfMonth(this.currentDate);
    } else {
      return startOfWeek(this.currentDate, { weekStartsOn: 1 }); // понедельник
    }
  }

  /**
   * Computed: конец периода
   */
  get dateTo(): Date {
    if (this.periodType === 'month') {
      return endOfMonth(this.currentDate);
    } else {
      return endOfWeek(this.currentDate, { weekStartsOn: 1 }); // воскресенье
    }
  }

  /**
   * Computed: дата для UI
   */
  get formattedDate(): string {
    if (this.periodType === 'month') {
      return format(this.currentDate, 'LLLL yyyy', { locale: ru });
    } else {
      const from = format(this.dateFrom, 'd MMM', { locale: ru });
      const to = format(this.dateTo, 'd MMM yyyy', { locale: ru });
      return `${from} - ${to}`;
    }
  }

  /**
   * Загрузить статистику
   */
  async fetchStats(): Promise<void> {
    if (!this.serviceCenterUuid) {
      console.warn('ServiceCenterUuid не установлен');
      return;
    }

    const response = await adminAnalyticsGetStats({
      serviceCenterUuid: this.serviceCenterUuid,
      dateFrom: this.dateFrom.toISOString(),
      dateTo: this.dateTo.toISOString(),
      period: this.periodType,
    });

    runInAction(() => {
      this.stats = response;
    });
  }

  /**
   * Загрузить топ услуги
   */
  async fetchTopServices(): Promise<void> {
    if (!this.serviceCenterUuid) {
      console.warn('ServiceCenterUuid не установлен');
      return;
    }

    const response = await adminAnalyticsGetTopServices({
      serviceCenterUuid: this.serviceCenterUuid,
      dateFrom: this.dateFrom.toISOString(),
      dateTo: this.dateTo.toISOString(),
      limit: 10,
    });

    runInAction(() => {
      this.topServices = response.top_services;
    });
  }

  /**
   * Загрузить данные графика
   */
  async fetchLoadChart(): Promise<void> {
    if (!this.serviceCenterUuid) {
      console.warn('ServiceCenterUuid не установлен');
      return;
    }

    const response = await adminAnalyticsGetLoadChart({
      serviceCenterUuid: this.serviceCenterUuid,
      dateFrom: this.dateFrom.toISOString(),
      dateTo: this.dateTo.toISOString(),
      period: this.periodType,
    });

    runInAction(() => {
      this.loadChartData = response;
    });
  }

  /**
   * Загрузить все данные
   */
  async fetchAll(): Promise<void> {
    if (!this.serviceCenterUuid) {
      console.warn('ServiceCenterUuid не установлен');
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await Promise.all([
        this.fetchStats(),
        this.fetchTopServices(),
        this.fetchLoadChart(),
      ]);

      runInAction(() => {
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки данных аналитики';
        this.isLoading = false;
      });
      console.error('Ошибка при загрузке данных аналитики:', error);
      toastStore.showError('Не удалось загрузить данные аналитики');
    }
  }
}

// Экспортируем singleton instance
export const analyticsStore = new AnalyticsStore();

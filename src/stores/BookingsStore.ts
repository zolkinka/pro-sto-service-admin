import { makeAutoObservable, runInAction } from 'mobx';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import type { 
  DetailedBookingResponseDto,
  AdminBookingResponseDto,
  UpdateAdminBookingDto,
} from '../../services/api-client';
import {
  adminBookingsGetList,
  adminBookingsGetOne,
  adminBookingsUpdate,
  adminBookingsUpdateStatus,
  adminBookingsGetPending,
} from '../../services/api-client';
import { toastStore } from './ToastStore';

// Тип статуса бронирования
export type BookingStatus = 'pending_confirmation' | 'confirmed' | 'completed' | 'cancelled';

/**
 * Store для управления бронированиями (заказами)
 * Управляет загрузкой, фильтрацией, редактированием и изменением статусов заказов
 */
export class BookingsStore {
  // Список бронирований
  bookings: AdminBookingResponseDto[] = [];
  
  // Список бронирований ожидающих подтверждения
  pendingBookings: AdminBookingResponseDto[] = [];
  
  // Детальная информация о выбранном бронировании
  selectedBooking: DetailedBookingResponseDto | null = null;
  
  // Состояние загрузки
  isLoading = false;
  isLoadingDetails = false;
  isLoadingPending = false;
  
  // Ошибки
  error: string | null = null;

  // Фильтры
  dateFrom: Date = startOfWeek(new Date(), { weekStartsOn: 1 }); // начало текущей недели (понедельник)
  dateTo: Date = endOfWeek(new Date(), { weekStartsOn: 1 }); // конец текущей недели (воскресенье)
  selectedStatuses: BookingStatus[] = []; // пустой массив = все статусы

  // UUID текущего сервисного центра (из профиля админа)
  serviceCenterUuid: string | null = null;

  // Пагинация
  total = 0;
  limit = 100;
  offset = 0;

  // Кэш для предотвращения ненужных загрузок и скелетонов
  private bookingsCache = new Map<string, AdminBookingResponseDto[]>();
  private isInitialLoad = true;

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
   * Установка диапазона дат для фильтрации
   */
  setDateRange(from: Date, to: Date) {
    this.dateFrom = from;
    this.dateTo = to;
  }

  /**
   * Установка фильтра по статусам
   */
  setSelectedStatuses(statuses: BookingStatus[]) {
    this.selectedStatuses = statuses;
  }

  /**
   * Генерирует ключ кэша для текущего запроса
   */
  private getCacheKey(): string {
    const dateFrom = format(this.dateFrom, 'yyyy-MM-dd');
    const dateTo = format(this.dateTo, 'yyyy-MM-dd');
    const statuses = this.selectedStatuses.join(',') || 'all';
    return `${dateFrom}_${dateTo}_${statuses}`;
  }

  /**
   * Проверяет, есть ли данные в кэше для текущего диапазона дат
   */
  hasCachedData(): boolean {
    const cacheKey = this.getCacheKey();
    return this.bookingsCache.has(cacheKey);
  }

  /**
   * Создает ключ кэша для указанных дат
   */
  private getCacheKeyForDates(dateFrom: Date, dateTo: Date, statuses: BookingStatus[]): string {
    const from = dateFrom.toISOString().split('T')[0];
    const to = dateTo.toISOString().split('T')[0];
    const statusesStr = statuses.sort().join(',');
    return `${this.serviceCenterUuid}_${from}_${to}_${statusesStr}`;
  }

  /**
   * Предзагружает данные для соседних периодов (предыдущего и следующего)
   * Это позволяет избежать задержек при переключении между периодами
   */
  async prefetchAdjacentPeriods(): Promise<void> {
    if (!this.dateFrom || !this.dateTo || !this.serviceCenterUuid) return;

    const currentDateFrom = new Date(this.dateFrom);
    const currentDateTo = new Date(this.dateTo);
    
    // Вычисляем длительность текущего периода в днях
    const periodDays = Math.ceil((currentDateTo.getTime() - currentDateFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    try {
      // Предзагружаем предыдущий период (если еще не в кэше)
      const prevDateFrom = new Date(currentDateFrom);
      prevDateFrom.setDate(prevDateFrom.getDate() - periodDays);
      const prevDateTo = new Date(currentDateTo);
      prevDateTo.setDate(prevDateTo.getDate() - periodDays);
      
      const prevCacheKey = this.getCacheKeyForDates(prevDateFrom, prevDateTo, this.selectedStatuses);
      if (!this.bookingsCache.has(prevCacheKey)) {
        const prevResponse = await adminBookingsGetList({
          serviceCenterUuid: this.serviceCenterUuid,
          dateFrom: prevDateFrom.toISOString(),
          dateTo: prevDateTo.toISOString(),
          status: this.selectedStatuses.length > 0 ? (this.selectedStatuses as unknown as Array<unknown[]>) : undefined,
        });
        
        if (prevResponse.data) {
          this.bookingsCache.set(prevCacheKey, prevResponse.data);
        }
      }

      // Предзагружаем следующий период (если еще не в кэше)
      const nextDateFrom = new Date(currentDateFrom);
      nextDateFrom.setDate(nextDateFrom.getDate() + periodDays);
      const nextDateTo = new Date(currentDateTo);
      nextDateTo.setDate(nextDateTo.getDate() + periodDays);
      
      const nextCacheKey = this.getCacheKeyForDates(nextDateFrom, nextDateTo, this.selectedStatuses);
      if (!this.bookingsCache.has(nextCacheKey)) {
        const nextResponse = await adminBookingsGetList({
          serviceCenterUuid: this.serviceCenterUuid,
          dateFrom: nextDateFrom.toISOString(),
          dateTo: nextDateTo.toISOString(),
          status: this.selectedStatuses.length > 0 ? (this.selectedStatuses as unknown as Array<unknown[]>) : undefined,
        });
        
        if (nextResponse.data) {
          this.bookingsCache.set(nextCacheKey, nextResponse.data);
        }
      }
    } catch (error) {
      console.warn('Failed to prefetch adjacent periods:', error);
    }
  }

  /**   * Загрузка списка бронирований
   * @param silent - если true, загрузка произойдет без показа скелетона (тихое обновление)
   */
  async fetchBookings(silent = false): Promise<void> {
    if (!this.serviceCenterUuid) {
      console.warn('ServiceCenterUuid не установлен');
      return;
    }

    const cacheKey = this.getCacheKey();
    const cachedData = this.bookingsCache.get(cacheKey);

    // Если есть кэшированные данные и это не первая загрузка, используем их сразу
    if (cachedData && !this.isInitialLoad) {
      runInAction(() => {
        this.bookings = cachedData;
        this.isLoading = false;
      });
      
      // Для кэшированных данных не делаем дополнительный запрос
      // Данные будут обновлены при следующем явном вызове fetchBookings
      return;
    }

    // Показываем скелетон только при первой загрузке или отсутствии кэша
    if (!silent && this.isInitialLoad) {
      this.isLoading = true;
    }
    
    this.error = null;

    try {
      const response = await adminBookingsGetList({
        serviceCenterUuid: this.serviceCenterUuid,
        dateFrom: this.dateFrom.toISOString(),
        dateTo: this.dateTo.toISOString(),
        status: this.selectedStatuses.length > 0 ? (this.selectedStatuses as unknown as Array<unknown[]>) : undefined,
        limit: this.limit,
        offset: this.offset,
      });

      runInAction(() => {
        this.bookings = response.data;
        this.total = response.total;
        this.isLoading = false;
        this.isInitialLoad = false;
        
        // Сохраняем данные в кэш
        this.bookingsCache.set(cacheKey, response.data);
      });

      // Предзагружаем соседние периоды (только при не-silent загрузке)
      if (!silent) {
        this.prefetchAdjacentPeriods().catch(err => {
          console.warn('Failed to prefetch adjacent periods:', err);
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки бронирований';
        this.isLoading = false;
      });
      console.error('Ошибка при загрузке бронирований:', error);
      toastStore.showError('Не удалось загрузить список заказов');
    }
  }

  /**
   * Тихое обновление данных без показа скелетона
   * Используется после изменения статуса или данных бронирования
   */
  async refreshBookings(): Promise<void> {
    await this.fetchBookings(true);
  }

  /**
   * Загрузка бронирований в статусе pending_confirmation
   */
  async fetchPendingBookings(): Promise<void> {
    if (!this.serviceCenterUuid) {
      console.warn('ServiceCenterUuid не установлен');
      return;
    }

    this.isLoadingPending = true;
    this.error = null;

    try {
      const response = await adminBookingsGetPending({
        serviceCenterUuid: this.serviceCenterUuid,
      });

      runInAction(() => {
        this.pendingBookings = response.data;
        this.isLoadingPending = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки ожидающих бронирований';
        this.isLoadingPending = false;
      });
      console.error('Ошибка при загрузке ожидающих бронирований:', error);
      toastStore.showError('Не удалось загрузить список ожидающих заказов');
    }
  }

  /**
   * Загрузка детальной информации о бронировании
   */
  async fetchBookingDetails(uuid: string): Promise<void> {
    // Очищаем предыдущие данные перед загрузкой новых
    // чтобы избежать показа данных предыдущего заказа
    this.selectedBooking = null;
    this.isLoadingDetails = true;
    this.error = null;

    try {
      const booking = await adminBookingsGetOne({ uuid });

      runInAction(() => {
        this.selectedBooking = booking;
        this.isLoadingDetails = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки деталей бронирования';
        this.isLoadingDetails = false;
      });
      console.error('Ошибка при загрузке деталей бронирования:', error);
      toastStore.showError('Не удалось загрузить детали заказа');
    }
  }

  /**
   * Обновление статуса бронирования
   * Использует оптимистичное обновление UI
   */
  async updateBookingStatus(uuid: string, status: BookingStatus): Promise<boolean> {
    // Сохраняем текущее состояние для возможности отката
    const bookingIndex = this.bookings.findIndex((b) => b.uuid === uuid);
    const previousStatus = bookingIndex !== -1 ? this.bookings[bookingIndex].status : null;

    // Оптимистичное обновление UI
    runInAction(() => {
      if (bookingIndex !== -1) {
        this.bookings[bookingIndex].status = status;
      } else {
        // Если заказа нет в основном списке (например, был pending),
        // добавляем его туда из списка pendingBookings
        const pendingBooking = this.pendingBookings.find((b) => b.uuid === uuid);
        if (pendingBooking) {
          this.bookings.push({
            ...pendingBooking,
            status: status,
          });
        }
      }

      // Если это выбранное бронирование, обновляем и его
      if (this.selectedBooking?.uuid === uuid) {
        this.selectedBooking.status = status;
      }

      // Если статус изменился с pending_confirmation на другой, удаляем из pendingBookings
      if (status !== 'pending_confirmation') {
        this.pendingBookings = this.pendingBookings.filter((b) => b.uuid !== uuid);
      }
    });

    try {
      await adminBookingsUpdateStatus({
        uuid,
        requestBody: { status },
      });

      // Обновляем кэш после успешного ответа
      this.invalidateCache();

      toastStore.showSuccess('Статус заказа успешно обновлен');
      
      // Тихо обновляем данные с сервера
      await this.refreshBookings();
      
      return true;
    } catch (error) {
      // При ошибке откатываем изменения
      runInAction(() => {
        if (bookingIndex !== -1 && previousStatus !== null) {
          this.bookings[bookingIndex].status = previousStatus;
        }
        if (this.selectedBooking?.uuid === uuid && previousStatus !== null) {
          this.selectedBooking.status = previousStatus as BookingStatus;
        }
      });

      console.error('Ошибка при обновлении статуса:', error);
      toastStore.showError('Не удалось обновить статус заказа');
      return false;
    }
  }

  /**
   * Обновление данных бронирования
   * Использует оптимистичное обновление UI
   */
  async updateBooking(uuid: string, data: UpdateAdminBookingDto): Promise<boolean> {
    try {
      const updatedBooking = await adminBookingsUpdate({
        uuid,
        requestBody: data,
      });

      runInAction(() => {
        // Обновляем бронирование в списке
        const bookingIndex = this.bookings.findIndex((b) => b.uuid === uuid);
        if (bookingIndex !== -1) {
          // Обновляем основные поля из DetailedBookingResponseDto
          this.bookings[bookingIndex] = {
            ...this.bookings[bookingIndex],
            start_time: updatedBooking.start_time,
            end_time: updatedBooking.end_time,
            total_cost: updatedBooking.total_cost,
            service: updatedBooking.service,
            additionalServices: updatedBooking.additionalServices,
          };
        }

        // Обновляем выбранное бронирование
        if (this.selectedBooking?.uuid === uuid) {
          this.selectedBooking = updatedBooking;
        }
      });

      // Обновляем кэш после успешного ответа
      this.invalidateCache();

      toastStore.showSuccess('Заказ успешно обновлен');
      
      // Тихо обновляем данные с сервера
      await this.refreshBookings();
      
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении бронирования:', error);
      toastStore.showError('Не удалось обновить заказ');
      return false;
    }
  }

  /**
   * Инвалидация кэша
   * Используется после изменений данных
   */
  private invalidateCache(): void {
    this.bookingsCache.clear();
  }

  /**
   * Добавление нового бронирования в список (после создания)
   * Используется для оптимистичного обновления UI
   */
  addBooking(booking: AdminBookingResponseDto): void {
    runInAction(() => {
      // Проверяем, входит ли бронирование в текущий временной диапазон
      const bookingDate = new Date(booking.start_time);
      if (bookingDate >= this.dateFrom && bookingDate <= this.dateTo) {
        // Проверяем, нет ли уже такого бронирования в списке
        const exists = this.bookings.some(b => b.uuid === booking.uuid);
        if (!exists) {
          this.bookings.push(booking);
          this.total++;
        }
      }
    });
    
    // Инвалидируем кэш после добавления
    this.invalidateCache();
  }

  /**
   * Очистка выбранного бронирования
   */
  clearSelectedBooking() {
    this.selectedBooking = null;
  }

  /**
   * Геттер: группировка бронирований по датам
   * Возвращает Map, где ключ - дата в формате YYYY-MM-DD, значение - массив бронирований
   */
  get bookingsByDate(): Map<string, AdminBookingResponseDto[]> {
    const grouped = new Map<string, AdminBookingResponseDto[]>();

    this.bookings.forEach((booking) => {
      const date = format(parseISO(booking.start_time), 'yyyy-MM-dd');
      
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      
      grouped.get(date)!.push(booking);
    });

    return grouped;
  }

  /**
   * Геттер: группировка бронирований по временным слотам
   * Возвращает Map, где ключ - временной слот в формате HH:mm, значение - массив бронирований
   */
  get bookingsByTimeSlot(): Map<string, AdminBookingResponseDto[]> {
    const grouped = new Map<string, AdminBookingResponseDto[]>();

    this.bookings.forEach((booking) => {
      const timeSlot = format(parseISO(booking.start_time), 'HH:mm');
      
      if (!grouped.has(timeSlot)) {
        grouped.set(timeSlot, []);
      }
      
      grouped.get(timeSlot)!.push(booking);
    });

    return grouped;
  }

  /**
   * Геттер: получить бронирования для конкретной даты
   */
  getBookingsForDate(date: Date): AdminBookingResponseDto[] {
    const dateKey = format(date, 'yyyy-MM-dd');
    return this.bookingsByDate.get(dateKey) || [];
  }

  /**
   * Геттер: получить бронирования для конкретного временного слота в конкретную дату
   */
  getBookingsForTimeSlot(date: Date, timeSlot: string): AdminBookingResponseDto[] {
    const dateKey = format(date, 'yyyy-MM-dd');
    const bookingsForDate = this.bookingsByDate.get(dateKey) || [];
    
    return bookingsForDate.filter((booking) => {
      const bookingTimeSlot = format(parseISO(booking.start_time), 'HH:mm');
      return bookingTimeSlot === timeSlot;
    });
  }

  /**
   * Геттер: статистика по статусам
   */
  get statusStats() {
    const stats = {
      pending_confirmation: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    this.bookings.forEach((booking) => {
      const status = booking.status as BookingStatus;
      if (status in stats) {
        stats[status]++;
      }
    });

    return stats;
  }

  /**
   * Геттер: общая выручка за выбранный период
   */
  get totalRevenue(): number {
    return this.bookings
      .filter((b) => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.total_cost, 0);
  }
}

// Экспортируем singleton instance
export const bookingsStore = new BookingsStore();

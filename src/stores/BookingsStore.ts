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
   * Загрузка списка бронирований
   */
  async fetchBookings(): Promise<void> {
    if (!this.serviceCenterUuid) {
      console.warn('ServiceCenterUuid не установлен');
      return;
    }

    this.isLoading = true;
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
      });
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
   */
  async updateBookingStatus(uuid: string, status: BookingStatus): Promise<boolean> {
    try {
      const response = await adminBookingsUpdateStatus({
        uuid,
        requestBody: { status },
      });

      runInAction(() => {
        // Обновляем статус в списке бронирований
        const bookingIndex = this.bookings.findIndex((b) => b.uuid === uuid);
        if (bookingIndex !== -1) {
          this.bookings[bookingIndex].status = response.status;
        }

        // Если это выбранное бронирование, обновляем и его
        if (this.selectedBooking?.uuid === uuid) {
          this.selectedBooking.status = response.status as BookingStatus;
        }
      });

      toastStore.showSuccess('Статус заказа успешно обновлен');
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      toastStore.showError('Не удалось обновить статус заказа');
      return false;
    }
  }

  /**
   * Обновление данных бронирования
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

      toastStore.showSuccess('Заказ успешно обновлен');
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении бронирования:', error);
      toastStore.showError('Не удалось обновить заказ');
      return false;
    }
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

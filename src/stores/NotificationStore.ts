import { makeAutoObservable, runInAction } from 'mobx';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
} from '../../services/api-client';
import type { NotificationResponseDto } from '../../services/api-client';
import { toastStore } from './ToastStore';
import { bookingsStore } from './BookingsStore';
import { authStore } from './AuthStore';

/**
 * Store для управления уведомлениями в админ-панели
 * Поддерживает пагинацию, фильтрацию и polling
 */
export class NotificationStore {
  notifications: NotificationResponseDto[] = [];
  unreadCount = 0;
  total = 0;
  page = 1;
  limit = 20;
  isLoading = false;
  
  // Фильтр по статусу прочтения
  filterIsRead: boolean | undefined = undefined;
  
  // Таймер для polling
  private pollingTimer: NodeJS.Timeout | null = null;
  private readonly POLLING_INTERVAL = 30000; // 30 секунд

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Загрузка уведомлений с сервера
   */
  fetchNotifications = async (resetPage = false): Promise<void> => {
    if (resetPage) {
      this.page = 1;
    }

    this.isLoading = true;

    try {
      const response = await getNotifications({
        page: this.page,
        limit: this.limit,
        isRead: this.filterIsRead,
      });

      runInAction(() => {
        if (resetPage) {
          this.notifications = response.items;
        } else {
          // Для пагинации добавляем к существующим
          this.notifications = [...this.notifications, ...response.items];
        }
        this.total = response.total;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
      console.error('Ошибка при загрузке уведомлений:', error);
      toastStore.showError('Не удалось загрузить уведомления');
    }
  };

  /**
   * Получение количества непрочитанных уведомлений
   * @returns true если количество увеличилось (есть новые уведомления)
   */
  getUnreadCount = async (): Promise<boolean> => {
    try {
      const response = await getUnreadNotificationsCount();
      const newCount = response.count || 0;
      const previousCount = this.unreadCount;
      
      runInAction(() => {
        this.unreadCount = newCount;
      });
      
      // Возвращаем true если количество увеличилось
      return newCount > previousCount;
    } catch (error) {
      console.error('Ошибка при получении количества непрочитанных:', error);
      return false;
    }
  };

  /**
   * Пометить уведомление как прочитанное
   */
  markAsRead = async (uuid: string): Promise<void> => {
    try {
      await markNotificationAsRead({ uuid });

      runInAction(() => {
        // Обновляем статус в локальном списке
        const notification = this.notifications.find((n) => n.uuid === uuid);
        if (notification) {
          notification.isRead = true;
        }
        
        // Уменьшаем счетчик непрочитанных
        if (this.unreadCount > 0) {
          this.unreadCount--;
        }
      });
    } catch (error) {
      console.error('Ошибка при пометке уведомления как прочитанного:', error);
      toastStore.showError('Не удалось обновить статус уведомления');
    }
  };

  /**
   * Пометить уведомление как прочитанное по booking_uuid
   * Используется при просмотре заказа из баннера pending bookings
   */
  markAsReadByBookingUuid = async (bookingUuid: string): Promise<void> => {
    // Сначала ищем в уже загруженных уведомлениях
    const notification = this.notifications.find((n) => {
      if (n.data && typeof n.data === 'object') {
        return (n.data as Record<string, unknown>).booking_uuid === bookingUuid;
      }
      return false;
    });

    if (notification && !notification.isRead) {
      await this.markAsRead(notification.uuid);
    }
  };

  /**
   * Пометить все уведомления как прочитанные
   */
  markAllAsRead = async (): Promise<void> => {
    try {
      await markAllNotificationsAsRead();

      runInAction(() => {
        // Обновляем все уведомления в списке
        this.notifications.forEach((notification) => {
          notification.isRead = true;
        });
        
        // Сбрасываем счетчик
        this.unreadCount = 0;
      });

      toastStore.showSuccess('Все уведомления отмечены как прочитанные');
    } catch (error) {
      console.error('Ошибка при пометке всех уведомлений как прочитанных:', error);
      toastStore.showError('Не удалось обновить уведомления');
    }
  };

  /**
   * Загрузить следующую страницу уведомлений
   */
  loadMore = async (): Promise<void> => {
    if (this.notifications.length >= this.total) {
      return;
    }

    this.page++;
    await this.fetchNotifications(false);
  };

  /**
   * Установить фильтр по статусу прочтения
   */
  setFilterIsRead = (isRead: boolean | undefined): void => {
    this.filterIsRead = isRead;
    this.fetchNotifications(true);
  };

  /**
   * Запустить автоматическое обновление (polling)
   * Оптимизировано: загружает уведомления только если unreadCount увеличился
   * и загружает pending bookings если есть новые уведомления о заказах
   */
  startPolling = (): void => {
    // Останавливаем предыдущий таймер, если он был
    this.stopPolling();

    // Запускаем polling
    this.pollingTimer = setInterval(async () => {
      // Проверяем, изменилось ли количество непрочитанных
      const hasNewNotifications = await this.getUnreadCount();
      
      if (hasNewNotifications) {
        console.log('NotificationStore: Обнаружены новые уведомления, загружаем...');
        
        // Загружаем уведомления только если количество увеличилось
        await this.fetchNotifications(true);
        
        // Проверяем, есть ли среди новых уведомлений уведомления о новых заказах
        const hasNewBookingNotifications = this.notifications.some(
          (n) => !n.isRead && n.type === 'new_booking'
        );
        
        if (hasNewBookingNotifications) {
          console.log('NotificationStore: Есть новые уведомления о заказах, загружаем pending bookings...');
          
          // Загружаем pending bookings для отображения баннера
          const serviceCenterUuid = authStore.user?.service_center_uuid;
          if (serviceCenterUuid) {
            bookingsStore.setServiceCenterUuid(serviceCenterUuid);
            bookingsStore.fetchPendingBookings();
          }
        }
      }
    }, this.POLLING_INTERVAL);
  };

  /**
   * Остановить автоматическое обновление
   */
  stopPolling = (): void => {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  };

  /**
   * Очистка при размонтировании
   */
  cleanup = (): void => {
    this.stopPolling();
  };
}

// Экспортируем singleton instance
export const notificationStore = new NotificationStore();

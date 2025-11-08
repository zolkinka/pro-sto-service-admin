import { makeAutoObservable, runInAction } from 'mobx';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
} from '../../services/api-client';
import type { NotificationResponseDto } from '../../services/api-client';
import { toastStore } from './ToastStore';

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
  private readonly POLLING_INTERVAL = 45000; // 45 секунд

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
   */
  getUnreadCount = async (): Promise<void> => {
    try {
      const response = await getUnreadNotificationsCount();
      
      runInAction(() => {
        this.unreadCount = response.count || 0;
      });
    } catch (error) {
      console.error('Ошибка при получении количества непрочитанных:', error);
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
   */
  startPolling = (): void => {
    // Останавливаем предыдущий таймер, если он был
    this.stopPolling();

    // Запускаем polling
    this.pollingTimer = setInterval(() => {
      this.getUnreadCount();
      // Обновляем список только если показываем непрочитанные или все
      if (this.filterIsRead === undefined || this.filterIsRead === false) {
        this.fetchNotifications(true);
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

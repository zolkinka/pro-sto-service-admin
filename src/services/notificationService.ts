import { 
  getToken, 
  onMessage, 
  type MessagePayload,
  isSupported as isMessagingSupported
} from 'firebase/messaging';
import { getFirebaseMessaging, VAPID_KEY, isFirebaseConfigured } from './firebase';
import { toastStore } from '@/stores/ToastStore';

/**
 * Типы уведомлений в системе
 */
export enum NotificationType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_COMPLETED = 'booking_completed',
}

/**
 * Интерфейс для настроек уведомлений
 */
export interface NotificationSettings {
  enabled: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
}

/**
 * Дефолтные настройки уведомлений
 */
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  types: {
    [NotificationType.BOOKING_CREATED]: true,
    [NotificationType.BOOKING_CONFIRMED]: true,
    [NotificationType.BOOKING_CANCELLED]: true,
    [NotificationType.BOOKING_REMINDER]: true,
    [NotificationType.BOOKING_COMPLETED]: true,
  },
};

class NotificationService {
  private currentToken: string | null = null;
  private settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
  private messageHandlers: Array<(payload: MessagePayload) => void> = [];

  /**
   * Проверка поддержки уведомлений в браузере
   */
  async isSupported(): Promise<boolean> {
    try {
      // Проверяем конфигурацию Firebase
      if (!isFirebaseConfigured()) {
        console.warn('Firebase is not configured properly');
        return false;
      }

      // Проверяем поддержку браузером
      const supported = await isMessagingSupported();
      if (!supported) {
        console.warn('Firebase Messaging is not supported in this browser');
        return false;
      }

      // Проверяем поддержку Notification API
      if (!('Notification' in window)) {
        console.warn('Notification API is not supported');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking notification support:', error);
      return false;
    }
  }

  /**
   * Запрос разрешения на уведомления у пользователя
   */
  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications are not supported');
      }

      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Получение FCM токена устройства
   * Регистрирует Service Worker и получает токен для отправки push-уведомлений
   */
  async getToken(): Promise<string | null> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        return null;
      }

      // Проверяем разрешение
      const permission = Notification.permission;
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      const messaging = getFirebaseMessaging();
      if (!messaging) {
        console.error('Failed to initialize Firebase Messaging');
        return null;
      }

      // Регистрируем Service Worker
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      console.log('Service Worker registered:', registration);

      // Получаем токен
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log('FCM Token received:', token);
        this.currentToken = token;
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      throw error;
    }
  }

  /**
   * Отправка токена на сервер
   * TODO: Реализовать, когда будет готов API endpoint
   * 
   * @param token FCM токен для отправки
   */
  async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: Добавить вызов API endpoint для сохранения токена
      // Пример:
      // await apiClient.saveDeviceToken({ fcm_token: token });
      
      console.log('Token should be sent to server:', token);
      console.warn('API endpoint for saving FCM token is not implemented yet');
      
      // Временное решение - сохраняем в localStorage
      localStorage.setItem('fcm_token', token);
    } catch (error) {
      console.error('Error sending token to server:', error);
      throw error;
    }
  }

  /**
   * Удаление токена с сервера
   * TODO: Реализовать, когда будет готов API endpoint
   */
  async removeTokenFromServer(): Promise<void> {
    try {
      // TODO: Добавить вызов API endpoint для удаления токена
      // Пример:
      // await apiClient.removeDeviceToken();
      
      console.log('Token should be removed from server');
      console.warn('API endpoint for removing FCM token is not implemented yet');
      
      // Временное решение - удаляем из localStorage
      localStorage.removeItem('fcm_token');
    } catch (error) {
      console.error('Error removing token from server:', error);
      throw error;
    }
  }

  /**
   * Инициализация уведомлений
   * Запрашивает разрешение, получает токен и настраивает обработчики
   */
  async initialize(): Promise<boolean> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        console.warn('Notifications are not supported, skipping initialization');
        return false;
      }

      // Загружаем сохраненные настройки
      this.loadSettings();

      // Если уведомления отключены, не инициализируем
      if (!this.settings.enabled) {
        console.log('Notifications are disabled in settings');
        return false;
      }

      // Запрашиваем разрешение
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Получаем токен
      const token = await this.getToken();
      if (!token) {
        console.error('Failed to get FCM token');
        return false;
      }

      // Отправляем токен на сервер
      await this.sendTokenToServer(token);

      // Настраиваем обработчик сообщений переднего плана
      this.setupForegroundMessageHandler();

      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  /**
   * Настройка обработчика сообщений на переднем плане
   * Срабатывает, когда приложение активно
   */
  private setupForegroundMessageHandler(): void {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);

      // Вызываем пользовательские обработчики
      this.messageHandlers.forEach(handler => handler(payload));

      // Показываем toast с уведомлением
      const { notification } = payload;
      if (notification) {
        toastStore.showInfo(
          notification.body || 'Новое уведомление',
          notification.title || 'Уведомление'
        );
      }
    });
  }

  /**
   * Добавление обработчика сообщений
   * @param handler Функция-обработчик
   */
  addMessageHandler(handler: (payload: MessagePayload) => void): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Удаление обработчика сообщений
   * @param handler Функция-обработчик для удаления
   */
  removeMessageHandler(handler: (payload: MessagePayload) => void): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  /**
   * Получить текущий токен
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Получить настройки уведомлений
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Обновить настройки уведомлений
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...settings,
    };

    // Сохраняем настройки в localStorage
    this.saveSettings();

    // Если уведомления были отключены, удаляем токен с сервера
    if (settings.enabled === false) {
      await this.removeTokenFromServer();
    }
    // Если уведомления были включены, инициализируем заново
    else if (settings.enabled === true) {
      await this.initialize();
    }
  }

  /**
   * Загрузка настроек из localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('notification_settings');
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  /**
   * Сохранение настроек в localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Обработка обновления токена
   * Вызывается когда Firebase генерирует новый токен
   */
  async onTokenRefresh(newToken: string): Promise<void> {
    console.log('Token refreshed:', newToken);
    this.currentToken = newToken;
    
    // Отправляем обновленный токен на сервер
    await this.sendTokenToServer(newToken);
  }
}

// Экспортируем singleton instance
export const notificationService = new NotificationService();

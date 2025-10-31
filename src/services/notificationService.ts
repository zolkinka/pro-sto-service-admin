import { 
  getToken, 
  onMessage, 
  type MessagePayload,
  isSupported as isMessagingSupported
} from 'firebase/messaging';
import { getFirebaseMessaging, VAPID_KEY, isFirebaseConfigured } from './firebase';
import { toastStore } from '@/stores/ToastStore';
import { 
  registerNotificationToken,
  unregisterNotificationToken,
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettingsDto
} from '../../services/api-client';

/**
 * Типы уведомлений в системе (соответствуют API)
 */
export enum NotificationType {
  NEW_BOOKING = 'newBooking',
  STATUS_CHANGE = 'statusChange',
  REMINDERS = 'reminders',
  PROMOTIONS = 'promotions',
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
    [NotificationType.NEW_BOOKING]: true,
    [NotificationType.STATUS_CHANGE]: true,
    [NotificationType.REMINDERS]: true,
    [NotificationType.PROMOTIONS]: true,
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
   */
  async sendTokenToServer(token: string): Promise<void> {
    try {
      // Получаем информацию об устройстве
      const deviceId = this.getDeviceId();
      const deviceType = this.getDeviceType();
      const deviceName = this.getDeviceName();

      await registerNotificationToken({
        requestBody: {
          token,
          deviceId,
          deviceType,
          deviceName,
        },
      });

      console.log('Token successfully sent to server');
    } catch (error) {
      console.error('Error sending token to server:', error);
      throw error;
    }
  }

  /**
   * Удаление токена с сервера
   */
  async removeTokenFromServer(): Promise<void> {
    try {
      const deviceId = this.getDeviceId();

      await unregisterNotificationToken({
        requestBody: {
          deviceId,
        },
      });

      console.log('Token successfully removed from server');
    } catch (error) {
      console.error('Error removing token from server:', error);
      throw error;
    }
  }

  /**
   * Получить уникальный ID устройства
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    
    if (!deviceId) {
      // Генерируем уникальный ID устройства
      deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
  }

  /**
   * Получить тип устройства
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    
    if (/mobile/i.test(ua)) {
      return 'mobile';
    } else if (/tablet/i.test(ua)) {
      return 'tablet';
    }
    
    return 'desktop';
  }

  /**
   * Получить название устройства
   */
  private getDeviceName(): string {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    
    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
    }
    
    return `${browser} on ${this.getDeviceType()}`;
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

      // Загружаем настройки с сервера
      await this.loadSettingsFromServer();

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

    onMessage(messaging, (payload: MessagePayload) => {
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

    // Сохраняем настройки на сервере
    await this.saveSettingsToServer();

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
   * Загрузка настроек с сервера
   */
  private async loadSettingsFromServer(): Promise<void> {
    try {
      const serverSettings = await getNotificationSettings();
      
      // Маппим серверные настройки на клиентские
      this.settings = {
        enabled: true, // Если настройки есть на сервере, считаем что включены
        types: {
          [NotificationType.NEW_BOOKING]: serverSettings.newBooking ?? true,
          [NotificationType.STATUS_CHANGE]: serverSettings.statusChange ?? true,
          [NotificationType.REMINDERS]: serverSettings.reminders ?? true,
          [NotificationType.PROMOTIONS]: serverSettings.promotions ?? true,
        },
      };

      // Также сохраняем в localStorage для кэша
      this.saveSettingsToLocalStorage();
    } catch (error) {
      console.error('Error loading notification settings from server:', error);
      // В случае ошибки загружаем из localStorage
      this.loadSettingsFromLocalStorage();
    }
  }

  /**
   * Сохранение настроек на сервере
   */
  private async saveSettingsToServer(): Promise<void> {
    try {
      const serverSettings: NotificationSettingsDto = {
        newBooking: this.settings.types[NotificationType.NEW_BOOKING],
        statusChange: this.settings.types[NotificationType.STATUS_CHANGE],
        reminders: this.settings.types[NotificationType.REMINDERS],
        promotions: this.settings.types[NotificationType.PROMOTIONS],
      };

      await updateNotificationSettings({
        requestBody: serverSettings,
      });

      // Также сохраняем в localStorage
      this.saveSettingsToLocalStorage();
      
      console.log('Notification settings saved to server');
    } catch (error) {
      console.error('Error saving notification settings to server:', error);
      throw error;
    }
  }

  /**
   * Загрузка настроек из localStorage (fallback)
   */
  private loadSettingsFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('notification_settings');
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notification settings from localStorage:', error);
    }
  }

  /**
   * Сохранение настроек в localStorage (кэш)
   */
  private saveSettingsToLocalStorage(): void {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings to localStorage:', error);
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

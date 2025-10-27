import { makeAutoObservable, runInAction } from 'mobx';
import {
  adminAuthSendCode,
  adminAuthLogin,
  authRefresh,
} from '../../services/api-client';
import type { AdminUserDto } from '../../services/api-client';
import { toastStore } from './ToastStore';

/**
 * Store для управления аутентификацией администраторов
 * Использует adminAuthSendCode и adminAuthLogin для SMS-авторизации
 */
export class AuthStore {
  isAuthenticated = false;
  accessToken: string | null = null;
  refreshToken: string | null = null;
  user: AdminUserDto | null = null;
  isLoading = false;

  // Таймер для автоматического обновления токенов
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this);
    this.checkAuth();
  }

  /**
   * Проверка наличия токенов при загрузке приложения
   * Восстанавливает состояние из localStorage
   */
  checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr) as AdminUserDto;

        runInAction(() => {
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          this.user = user;
          this.isAuthenticated = true;
        });

        this.setupTokenRefresh();
      } catch (error) {
        console.error('Ошибка при парсинге данных пользователя:', error);
        this.logout();
      }
    }
  };

  /**
   * Отправка SMS кода на номер телефона администратора
   */
  sendCode = async (phone: string): Promise<void> => {
    this.isLoading = true;

    try {
      await adminAuthSendCode({
        requestBody: { phone },
      });
      
      // Успех - код отправлен
      runInAction(() => {
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
      
      toastStore.showError('Не удалось отправить код. Проверьте номер телефона.');
      throw error;
    }
  };

  /**
   * Вход по SMS коду
   */
  verifyCode = async (phone: string, code: string): Promise<void> => {
    this.isLoading = true;

    try {
      const response = await adminAuthLogin({
        requestBody: { phone, code },
      });

      runInAction(() => {
        this.accessToken = response.accessToken;
        this.refreshToken = response.refreshToken;
        this.user = response.user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });

      // Сохранение в localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      this.setupTokenRefresh();
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });

      toastStore.showError('Неверный код или истек срок действия.');
      throw error;
    }
  };

  /**
   * Обновление токенов
   */
  refreshTokens = async (): Promise<void> => {
    if (!this.accessToken) return;

    try {
      const response = await authRefresh();

      runInAction(() => {
        // authRefresh возвращает только новый accessToken
        this.accessToken = response.accessToken;
        localStorage.setItem('accessToken', response.accessToken);
      });

      this.setupTokenRefresh();
    } catch (error) {
      console.error('Ошибка при обновлении токенов:', error);
      // Если не удалось обновить токены - разлогиниваем
      this.logout();
    }
  };

  /**
   * Настройка автоматического обновления токенов
   * Обновляет токен за 10 минут до истечения
   */
  private setupTokenRefresh = () => {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // JWT обычно живет 15-60 минут
    // Обновляем токен через 10 минут
    const refreshTime = 10 * 60 * 1000; // 10 минут

    this.refreshTimer = setTimeout(() => {
      this.refreshTokens();
    }, refreshTime);
  };

  /**
   * Выход из системы
   * Очищает все данные и останавливает таймеры
   */
  logout = () => {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    runInAction(() => {
      this.isAuthenticated = false;
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };
}

// Экспортируем singleton instance
export const authStore = new AuthStore();

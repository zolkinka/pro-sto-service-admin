import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import {
  adminAuthSendCode,
  adminAuthLogin,
  OpenAPI,
} from '../../services/api-client';
import type { AdminUserDto, AuthRefreshResponse } from '../../services/api-client';
import { toastStore } from './ToastStore';
import { notificationService } from '@/services/notificationService';

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

        // Устанавливаем токен в OpenAPI для всех запросов
        OpenAPI.TOKEN = accessToken;

        // Инициализируем уведомления после восстановления сессии
        notificationService.initialize().catch((error) => {
          console.error('Failed to initialize notifications after auth restore:', error);
        });
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

      // Устанавливаем токен в OpenAPI для всех запросов
      OpenAPI.TOKEN = response.accessToken;

      // Инициализируем уведомления после успешной авторизации
      notificationService.initialize().catch((error) => {
        console.error('Failed to initialize notifications after login:', error);
      });
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
   * Используется interceptor'ом при получении 401 ошибки
   */
  refreshTokens = async (): Promise<void> => {
    if (!this.refreshToken) {
      console.error('Refresh token отсутствует');
      this.logout();
      return;
    }

    try {
      // Используем прямой axios запрос с явной передачей refresh token
      // Это избегает race condition с глобальным OpenAPI.TOKEN
      const response = await axios.post<AuthRefreshResponse>(
        `${OpenAPI.BASE}/api/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.refreshToken}`,
          },
        }
      );

      runInAction(() => {
        this.accessToken = response.data.accessToken;
        localStorage.setItem('accessToken', response.data.accessToken);
        this.refreshToken = response.data.refreshToken;
        localStorage.setItem('refreshToken', response.data.refreshToken);
      });

      // Обновляем токен в OpenAPI на новый access token
      OpenAPI.TOKEN = response.data.accessToken;
    } catch (error) {
      console.error('Ошибка при обновлении токенов:', error);
      
      // Разлогиниваем только при 401 ошибке (невалидный/истекший refresh token)
      // При network ошибках не разлогиниваем пользователя
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.logout();
      }
      
      throw error; // Пробрасываем ошибку для interceptor
    }
  };

  /**
   * Выход из системы
   * Очищает все данные аутентификации
   */
  logout = () => {
    runInAction(() => {
      this.isAuthenticated = false;
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
    });

    // Очищаем токен в OpenAPI
    OpenAPI.TOKEN = undefined;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };
}

// Экспортируем singleton instance
export const authStore = new AuthStore();

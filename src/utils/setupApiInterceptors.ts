import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { AuthStore } from '../stores/AuthStore';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });

  failedQueue = [];
};

/**
 * Настройка перехватчика ответов API для автоматического обновления токенов
 * при получении 401 ошибки
 */
export const setupApiInterceptors = (authStore: AuthStore) => {
  // Response interceptor для обработки 401 ошибок
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Проверяем, что это 401 ошибка и не запрос на авторизацию/refresh
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/send-code') &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        // Если уже идет процесс обновления токена
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Пытаемся обновить токен
          await authStore.refreshTokens();

          const newToken = authStore.accessToken;

          if (newToken) {
            // Токен обновлен успешно, обрабатываем очередь неудачных запросов
            processQueue(null, newToken);

            // Повторяем оригинальный запрос с новым токеном
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Не удалось обновить токен - разлогиниваем пользователя
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

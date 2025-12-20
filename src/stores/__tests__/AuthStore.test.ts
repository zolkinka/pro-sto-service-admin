import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthStore } from '../AuthStore';
import * as apiClient from '../../../services/api-client';
import { toastStore } from '../ToastStore';
import { notificationService } from '@/services/notificationService';

// Mock API client
vi.mock('../../../services/api-client', () => ({
  adminAuthSendCode: vi.fn(),
  adminAuthLogin: vi.fn(),
  authRefresh: vi.fn(),
  OpenAPI: {
    TOKEN: undefined,
  },
}));

// Mock ToastStore
vi.mock('../ToastStore', () => ({
  toastStore: {
    showError: vi.fn(),
  },
}));

// Mock notification service
vi.mock('@/services/notificationService', () => ({
  notificationService: {
    initialize: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthStore', () => {
  let authStore: AuthStore;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    
    // Clear localStorage mock
    localStorage.clear();
    (localStorage.getItem as any).mockReturnValue(null);
    
    // Reset OpenAPI TOKEN
    apiClient.OpenAPI.TOKEN = undefined;

    // Create new instance for each test
    authStore = new AuthStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.accessToken).toBe(null);
      expect(authStore.refreshToken).toBe(null);
      expect(authStore.user).toBe(null);
      expect(authStore.isLoading).toBe(false);
    });

    it('should restore session from localStorage', () => {
      const mockUser = {
        id: '123',
        phone: '+79991234567',
        role: 'admin',
      };

      (localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'accessToken') return 'test-access-token';
        if (key === 'refreshToken') return 'test-refresh-token';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      authStore = new AuthStore();

      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.accessToken).toBe('test-access-token');
      expect(authStore.refreshToken).toBe('test-refresh-token');
      expect(authStore.user).toEqual(mockUser);
      expect(apiClient.OpenAPI.TOKEN).toBe('test-access-token');
      expect(notificationService.initialize).toHaveBeenCalled();
    });

    it('should handle corrupted user data in localStorage', () => {
      (localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'accessToken') return 'test-access-token';
        if (key === 'refreshToken') return 'test-refresh-token';
        if (key === 'user') return 'invalid-json{';
        return null;
      });

      authStore = new AuthStore();

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.accessToken).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('sendCode', () => {
    it('should successfully send SMS code', async () => {
      (apiClient.adminAuthSendCode as any).mockResolvedValue({});

      await authStore.sendCode('+79991234567');

      expect(apiClient.adminAuthSendCode).toHaveBeenCalledWith({
        requestBody: { phone: '+79991234567' },
      });
      expect(authStore.isLoading).toBe(false);
    });

    it('should handle send code error', async () => {
      const error = new Error('Network error');
      (apiClient.adminAuthSendCode as any).mockRejectedValue(error);

      await expect(authStore.sendCode('+79991234567')).rejects.toThrow('Network error');

      expect(authStore.isLoading).toBe(false);
      expect(toastStore.showError).toHaveBeenCalledWith(
        'Не удалось отправить код. Проверьте номер телефона.'
      );
    });

    it('should set isLoading during send code process', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      (apiClient.adminAuthSendCode as any).mockImplementation(() => promise);

      const sendCodePromise = authStore.sendCode('+79991234567');

      expect(authStore.isLoading).toBe(true);

      resolvePromise!();
      await sendCodePromise;

      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('verifyCode', () => {
    it('should successfully verify code and login', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: '123',
          phone: '+79991234567',
          role: 'admin',
        },
      };

      (apiClient.adminAuthLogin as any).mockResolvedValue(mockResponse);

      await authStore.verifyCode('+79991234567', '123456');

      expect(apiClient.adminAuthLogin).toHaveBeenCalledWith({
        requestBody: { phone: '+79991234567', code: '123456' },
      });

      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.accessToken).toBe('new-access-token');
      expect(authStore.refreshToken).toBe('new-refresh-token');
      expect(authStore.user).toEqual(mockResponse.user);
      expect(authStore.isLoading).toBe(false);

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user));

      expect(apiClient.OpenAPI.TOKEN).toBe('new-access-token');
      expect(notificationService.initialize).toHaveBeenCalled();
    });

    it('should handle verify code error', async () => {
      const error = new Error('Invalid code');
      (apiClient.adminAuthLogin as any).mockRejectedValue(error);

      await expect(authStore.verifyCode('+79991234567', '000000')).rejects.toThrow('Invalid code');

      expect(authStore.isLoading).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
      expect(toastStore.showError).toHaveBeenCalledWith(
        'Неверный код или истек срок действия.'
      );
    });

    it('should set isLoading during verify code process', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });

      (apiClient.adminAuthLogin as any).mockImplementation(() => promise);

      const verifyCodePromise = authStore.verifyCode('+79991234567', '123456');

      expect(authStore.isLoading).toBe(true);

      resolvePromise!({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '1', phone: '+79991234567', role: 'admin' },
      });
      await verifyCodePromise;

      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('refreshTokens', () => {
    beforeEach(() => {
      authStore.accessToken = 'old-access-token';
      authStore.refreshToken = 'old-refresh-token';
      authStore.isAuthenticated = true;
    });

    it('should successfully refresh tokens', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (apiClient.authRefresh as any).mockResolvedValue(mockResponse);

      await authStore.refreshTokens();

      expect(apiClient.OpenAPI.TOKEN).toBe('new-access-token');
      expect(authStore.accessToken).toBe('new-access-token');
      expect(authStore.refreshToken).toBe('new-refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
    });

    it('should set refresh token as TOKEN before making refresh request', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (apiClient.authRefresh as any).mockImplementation(() => {
        // Check that refresh token is set as TOKEN during the call
        expect(apiClient.OpenAPI.TOKEN).toBe('old-refresh-token');
        return Promise.resolve(mockResponse);
      });

      await authStore.refreshTokens();
    });

    it('should logout on refresh error', async () => {
      const error = new Error('Refresh failed');
      (apiClient.authRefresh as any).mockRejectedValue(error);

      await expect(authStore.refreshTokens()).rejects.toThrow('Refresh failed');

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.accessToken).toBe(null);
      expect(authStore.refreshToken).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should logout if refresh token is missing', async () => {
      authStore.refreshToken = null;

      await authStore.refreshTokens();

      expect(authStore.isAuthenticated).toBe(false);
      expect(apiClient.authRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Automatic token refresh', () => {
    it('should setup automatic token refresh after login', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: '123',
          phone: '+79991234567',
          role: 'admin',
        },
      };

      (apiClient.adminAuthLogin as any).mockResolvedValue(mockResponse);
      (apiClient.authRefresh as any).mockResolvedValue({
        accessToken: 'refreshed-token',
        refreshToken: 'refreshed-refresh-token',
      });

      await authStore.verifyCode('+79991234567', '123456');

      // Verify authRefresh was not called yet
      expect(apiClient.authRefresh).not.toHaveBeenCalled();

      // Fast-forward time by 10 minutes
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

      // Now authRefresh should have been called
      expect(apiClient.authRefresh).toHaveBeenCalledTimes(1);
    });

    it('should clear refresh timer on logout', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: '123',
          phone: '+79991234567',
          role: 'admin',
        },
      };

      (apiClient.adminAuthLogin as any).mockResolvedValue(mockResponse);
      (apiClient.authRefresh as any).mockResolvedValue({
        accessToken: 'refreshed-token',
        refreshToken: 'refreshed-refresh-token',
      });

      await authStore.verifyCode('+79991234567', '123456');

      authStore.logout();

      // Fast-forward time by 10 minutes
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

      // Should not refresh after logout
      expect(apiClient.authRefresh).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      authStore.accessToken = 'test-access-token';
      authStore.refreshToken = 'test-refresh-token';
      authStore.user = {
        id: '123',
        phone: '+79991234567',
        role: 'admin',
      } as any;
      authStore.isAuthenticated = true;
    });

    it('should clear all auth data', () => {
      authStore.logout();

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.accessToken).toBe(null);
      expect(authStore.refreshToken).toBe(null);
      expect(authStore.user).toBe(null);
      expect(apiClient.OpenAPI.TOKEN).toBe(undefined);

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should stop automatic refresh timer', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: '123',
          phone: '+79991234567',
          role: 'admin',
        },
      };

      (apiClient.adminAuthLogin as any).mockResolvedValue(mockResponse);
      (apiClient.authRefresh as any).mockResolvedValue({
        accessToken: 'refreshed-token',
        refreshToken: 'refreshed-refresh-token',
      });

      const newAuthStore = new AuthStore();
      await newAuthStore.verifyCode('+79991234567', '123456');

      vi.clearAllMocks();

      newAuthStore.logout();

      // Fast-forward time - timer should not trigger
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

      expect(apiClient.authRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle notification initialization errors gracefully', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: '123',
          phone: '+79991234567',
          role: 'admin',
        },
      };

      (apiClient.adminAuthLogin as any).mockResolvedValue(mockResponse);
      (notificationService.initialize as any).mockRejectedValue(
        new Error('Notification init failed')
      );

      // Should not throw even if notification init fails
      await expect(authStore.verifyCode('+79991234567', '123456')).resolves.not.toThrow();

      expect(authStore.isAuthenticated).toBe(true);
    });

    it('should handle notification initialization errors on session restore', () => {
      const mockUser = {
        id: '123',
        phone: '+79991234567',
        role: 'admin',
      };

      (localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'accessToken') return 'test-access-token';
        if (key === 'refreshToken') return 'test-refresh-token';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      (notificationService.initialize as any).mockRejectedValue(
        new Error('Notification init failed')
      );

      // Should not throw even if notification init fails
      expect(() => new AuthStore()).not.toThrow();
    });
  });
});

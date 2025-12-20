import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { AuthStore } from '../AuthStore';
import * as apiClient from '../../../services/api-client';
import { toastStore } from '../ToastStore';
import { notificationService } from '@/services/notificationService';

// Mock axios
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios') as any;
  return {
    ...actual,
    default: {
      ...(actual.default || {}),
      post: vi.fn(),
      isAxiosError: vi.fn(),
    },
    post: vi.fn(),
    isAxiosError: vi.fn(),
  };
});

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
      apiClient.OpenAPI.BASE = 'http://localhost:5201';
    });

    it('should successfully refresh tokens', async () => {
      const mockResponse = {
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      };

      (axios.post as any).mockResolvedValue(mockResponse);

      await authStore.refreshTokens();

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5201/api/auth/refresh',
        {},
        {
          headers: {
            Authorization: 'Bearer old-refresh-token',
          },
        }
      );
      expect(apiClient.OpenAPI.TOKEN).toBe('new-access-token');
      expect(authStore.accessToken).toBe('new-access-token');
      expect(authStore.refreshToken).toBe('new-refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
    });

    it('should use refresh token in Authorization header', async () => {
      const mockResponse = {
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      };

      (axios.post as any).mockResolvedValue(mockResponse);

      await authStore.refreshTokens();

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer old-refresh-token',
          },
        })
      );
    });

    it('should logout on 401 error', async () => {
      const error = {
        response: { status: 401 },
        isAxiosError: true,
      };

      (axios.post as any).mockRejectedValue(error);
      (axios.isAxiosError as any).mockReturnValue(true);

      await expect(authStore.refreshTokens()).rejects.toEqual(error);

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.accessToken).toBe(null);
      expect(authStore.refreshToken).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should NOT logout on network error', async () => {
      const error = new Error('Network error');

      (axios.post as any).mockRejectedValue(error);
      (axios.isAxiosError as any).mockReturnValue(false);

      await expect(authStore.refreshTokens()).rejects.toThrow('Network error');

      // Should NOT logout - keep authentication state
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.accessToken).toBe('old-access-token');
      expect(authStore.refreshToken).toBe('old-refresh-token');
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should NOT logout on 500 error', async () => {
      const error = {
        response: { status: 500 },
        isAxiosError: true,
      };

      (axios.post as any).mockRejectedValue(error);
      (axios.isAxiosError as any).mockReturnValue(true);

      await expect(authStore.refreshTokens()).rejects.toEqual(error);

      // Should NOT logout on server error
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.accessToken).toBe('old-access-token');
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should logout if refresh token is missing', async () => {
      authStore.refreshToken = null;

      await authStore.refreshTokens();

      expect(authStore.isAuthenticated).toBe(false);
      expect(axios.post).not.toHaveBeenCalled();
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

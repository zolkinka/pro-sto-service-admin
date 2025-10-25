import type { ErrorState } from '@/types';

/**
 * Error handling utilities
 */

export class AppError extends Error {
  public code?: string | number;
  public statusCode?: number;

  constructor(message: string, code?: string | number, statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const createErrorState = (error: unknown): ErrorState => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
    };
  }

  return {
    message: 'Произошла неизвестная ошибка',
  };
};

export const handleApiError = (error: unknown): never => {
  console.error('API Error:', error);
  
  if (error instanceof AppError) {
    throw error;
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new AppError('Ошибка сети. Проверьте подключение к интернету.', 'NETWORK_ERROR');
  }

  // Handle generic errors
  throw new AppError('Произошла ошибка при выполнении запроса', 'UNKNOWN_ERROR');
};

export const logError = (error: unknown, context?: string): void => {
  const errorInfo = {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error('Application Error:', errorInfo);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
};
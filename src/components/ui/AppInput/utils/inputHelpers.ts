/**
 * Утилиты для работы с Input компонентами
 */

/**
 * Генерирует уникальный ID для input элемента
 */
export const generateInputId = (prefix: string = 'input'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Проверяет, является ли поле заполненным
 */
export const isFieldFilled = (value: string | undefined): boolean => {
  return Boolean(value && value.trim().length > 0);
};

/**
 * Форматирует текст ошибки
 */
export const formatErrorText = (error: string | boolean, errorText?: string): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error === true && errorText) {
    return errorText;
  }
  return '';
};

/**
 * Определяет, нужно ли показывать ошибку
 */
export const shouldShowError = (error: string | boolean | undefined): boolean => {
  return Boolean(error);
};

/**
 * Объединяет className с базовыми классами
 */
export const combineClassNames = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
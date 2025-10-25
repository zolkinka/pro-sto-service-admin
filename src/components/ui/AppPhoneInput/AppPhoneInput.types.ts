import type { AppInputProps } from '../AppInput/AppInput.types';

/**
 * Пропсы для компонента AppPhoneInput
 * Наследует все пропсы AppInput кроме size (всегда L) и иконок
 */
export interface AppPhoneInputProps extends Omit<AppInputProps, 'iconLeft' | 'iconRight' | 'size'> {
  /**
   * Callback при завершении ввода телефона (все 10 цифр введены)
   * @param phone - Чистый номер телефона без форматирования (10 цифр)
   */
  onPhoneComplete?: (phone: string) => void;
  
  /**
   * Callback для валидации номера
   * @param isValid - Результат валидации
   * @param phone - Чистый номер телефона
   */
  onValidate?: (isValid: boolean, phone: string) => void;
  
  /**
   * Автоматическая валидация при потере фокуса
   * @default true
   */
  validateOnBlur?: boolean;
  
  /**
   * Код страны (по умолчанию +7)
   * @default '+7'
   */
  countryCode?: string;
}

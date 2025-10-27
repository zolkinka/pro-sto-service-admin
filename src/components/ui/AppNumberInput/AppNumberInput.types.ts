import type { AppInputProps } from '../AppInput/AppInput.types';

export interface AppNumberInputProps extends Omit<AppInputProps, 'inputProps' | 'onChange' | 'onBlur'> {
  /**
   * Callback вызывается при изменении значения
   * Возвращает числовое значение или пустую строку
   */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Callback вызывается при потере фокуса
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Минимальное значение
   */
  min?: number;
  
  /**
   * Максимальное значение
   */
  max?: number;
  
  /**
   * Разрешить только целые числа (по умолчанию true)
   */
  integerOnly?: boolean;
}

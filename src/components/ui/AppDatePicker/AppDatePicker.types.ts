import type { AppBaseDropdownProps } from '../AppBaseDropdown/AppBaseDropdown';

export interface AppDatePickerProps {
  // Основное
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  
  // Input props
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean | string;
  required?: boolean;
  
  // Календарь
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  locale?: 'ru' | 'en';
  
  // Кастомизация
  className?: string;
  baseDropdownProps?: Partial<AppBaseDropdownProps>;
  
  // Тестирование
  'data-testid'?: string;
}

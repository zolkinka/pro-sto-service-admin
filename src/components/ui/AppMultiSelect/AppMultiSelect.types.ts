import type { ReactNode } from 'react';
import type { AppBaseDropdownProps } from '../AppBaseDropdown';

/** Опция для выбора */
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface AppMultiSelectProps {
  /** Массив выбранных значений */
  value?: SelectOption[];
  /** Label над полем */
  label?: string;
  /** Отключение компонента */
  disabled?: boolean;
  /** Сообщение об ошибке */
  error?: string;
  /** Обязательное поле */
  required?: boolean;
  /** Плейсхолдер для поиска */
  placeholder?: string;
  /** Плейсхолдер для поля поиска в dropdown */
  searchPlaceholder?: string;
  /** Показывать кнопку очистки всех */
  clearable?: boolean;
  /** Список опций */
  options: SelectOption[];
  /** Коллбэк изменения значений */
  onChange?: (value: SelectOption[]) => void;
  /** Кастомный toggle */
  toggle?: ReactNode;
  /** Кастомный dropdown */
  dropdown?: ReactNode;
  /** Кастомная опция */
  option?: ReactNode;
  /** Пропсы для dropdown */
  baseDropdownProps?: Partial<AppBaseDropdownProps>;
  /** Класс для обертки */
  className?: string;
}

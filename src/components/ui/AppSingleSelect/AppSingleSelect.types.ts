import type { ReactNode } from 'react';
import type { AppBaseDropdownProps } from '../AppBaseDropdown';

/** Опция для выбора */
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface AppSingleSelectProps {
  /** Выбранное значение */
  value?: SelectOption | null;
  /** Label над полем */
  label?: string;
  /** Отключение компонента */
  disabled?: boolean;
  /** Сообщение об ошибке */
  error?: string;
  /** Обязательное поле */
  required?: boolean;
  /** Плейсхолдер */
  placeholder?: string;
  /** Плейсхолдер для поиска */
  searchPlaceholder?: string;
  /** Показывать кнопку очистки */
  clearable?: boolean;
  /** Список опций */
  options: SelectOption[];
  /** Коллбэк изменения значения */
  onChange?: (value: SelectOption | null) => void;
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

import type { ReactNode } from 'react';
import type { AppBaseDropdownProps } from '../AppBaseDropdown';
import type { InputMask } from 'imask';

/** Опция для выбора */
export interface SelectOption {
  label: string;
  value: string | number | null;
  disabled?: boolean;
  /** Флаг, указывающий что это произвольное значение пользователя */
  isCustom?: boolean;
}

export interface AppAutocompleteProps {
  // Основные
  /** Выбранное значение - всегда объект SelectOption */
  value?: SelectOption;
  /** Коллбэк изменения значения - всегда возвращает SelectOption */
  onChange?: (value: SelectOption) => void;
  
  // Опции
  /** Список опций для автокомплита */
  options?: SelectOption[];
  /** Асинхронный поиск опций */
  onSearch?: (query: string) => Promise<SelectOption[]>;
  
  // Настройки поиска
  /** Минимальная длина запроса для асинхронного поиска (по умолчанию 2) */
  minSearchLength?: number;
  /** Задержка debounce для асинхронного поиска в миллисекундах (по умолчанию 300) */
  searchDebounce?: number;
  /** Функция валидации/трансформации ввода (возвращает валидное значение, опционально принимает event для работы с курсором) */
  onInputChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => string;
  
  // UI
  /** Label над полем */
  label?: string;
  /** Плейсхолдер */
  placeholder?: string;
  /** Сообщение об ошибке */
  error?: string;
  /** Отключение компонента */
  disabled?: boolean;
  /** Обязательное поле */
  required?: boolean;
  
  // Кастомизация
  /** Кастомный рендер опции */
  renderOption?: (option: SelectOption) => ReactNode;
  /** Кастомная функция фильтрации опций */
  filterOption?: (option: SelectOption, query: string) => boolean;
  
  // Служебные
  /** Класс для обертки */
  className?: string;
  /** Пропсы для базового dropdown */
  baseDropdownProps?: Partial<AppBaseDropdownProps>;
  
  // Поддержка маски ввода (прокидывается в AppInput)
  /** Маска для форматирования ввода (например, "+{7} (000) 000-00-00") */
  mask?: string;
  /** Возвращать ли размаскированное значение (true/false/'typed') */
  unmask?: boolean | 'typed';
  /** Символ-заполнитель для незаполненных позиций маски */
  placeholderChar?: string;
  /** Ленивое отображение маски (показывать только при фокусе) */
  lazy?: boolean;
  /** Callback при изменении значения маски */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAccept?: (value: string, maskRef: InputMask<any>) => void;
  /** Callback при завершении ввода маски */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete?: (value: string, maskRef: InputMask<any>) => void;
}

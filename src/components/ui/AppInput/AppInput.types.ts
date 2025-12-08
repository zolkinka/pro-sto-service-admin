import React from 'react';
import type { InputMask } from 'imask';

export interface AppInputProps {
  // Основные пропсы
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  
  // Label и описание
  label?: string;
  required?: boolean;
  
  // Ошибки
  error?: string | boolean;
  errorText?: string;
  
  // Визуальные настройки
  size?: 'M' | 'L';
  background?: 'muted' | 'default';
  roundedBottom?: boolean; // Управление нижними углами
  
  // Иконки
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  
  // Суффикс (постфикс) - текст справа от input (например, "₽", "мин")
  suffix?: string;
  
  // Обработчики
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  // Управление фокусом
  /** Декларативное управление фокусом. Если не передан, фокус управляется внутри компонента */
  focused?: boolean;
  
  // HTML атрибуты
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  
  // Для расширения специализированными компонентами
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  
  'data-testid'?: string;
  
  // Поддержка маски ввода (например, для телефонов)
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

// Типы для Styled Components
export interface InputWrapperProps {
  $disabled?: boolean;
}

export interface StyledLabelProps {
  $required?: boolean;
  $error?: boolean;
}

export interface InputContainerProps {
  $size: 'M' | 'L';
  $background: 'muted' | 'default';
  $error?: boolean;
  $isFocused?: boolean;
  $disabled?: boolean;
  $roundedBottom?: boolean;
}

export interface StyledInputProps {
  $size: 'M' | 'L';
  $disabled?: boolean;
}

export interface RequiredIndicatorProps {
  $error?: boolean;
}
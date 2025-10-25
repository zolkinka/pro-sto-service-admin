import React from 'react';

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
  
  // Иконки
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  
  // Обработчики
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  // HTML атрибуты
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  
  // Для расширения специализированными компонентами
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  
  'data-testid'?: string;
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
}

export interface StyledInputProps {
  $size: 'M' | 'L';
  $disabled?: boolean;
}

export interface RequiredIndicatorProps {
  $error?: boolean;
}
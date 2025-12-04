import React from 'react';

export interface AppTextareaProps {
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
  
  // Размеры textarea
  minRows?: number;
  maxRows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
  
  // Обработчики
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  
  // HTML атрибуты
  name?: string;
  id?: string;
  autoFocus?: boolean;
  className?: string;
  maxLength?: number;
  
  'data-testid'?: string;
}

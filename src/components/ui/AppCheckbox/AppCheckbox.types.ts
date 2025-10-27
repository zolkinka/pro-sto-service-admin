import React from 'react';

/**
 * Размеры чекбокса
 */
export type CheckboxSize = 'S' | 'M';

/**
 * Типы/варианты чекбокса
 */
export type CheckboxVariant = 'primary' | 'secondary';

/**
 * Свойства компонента AppCheckbox
 */
export interface AppCheckboxProps {
  /**
   * Состояние чекбокса (checked)
   */
  checked?: boolean;
  
  /**
   * Состояние indeterminate (частично выбран)
   * Используется для parent чекбоксов в группах
   */
  indeterminate?: boolean;
  
  /**
   * Отключен ли чекбокс
   */
  disabled?: boolean;
  
  /**
   * Размер чекбокса
   * @default 'M'
   */
  size?: CheckboxSize;
  
  /**
   * Вариант стиля чекбокса
   * @default 'primary'
   */
  variant?: CheckboxVariant;
  
  /**
   * Обработчик изменения состояния
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Текст лейбла
   */
  label?: string;
  
  /**
   * Дополнительный CSS класс
   */
  className?: string;
  
  /**
   * Test ID для тестирования
   */
  'data-testid'?: string;
}

/**
 * Внутренние свойства для styled-компонентов
 */
export interface StyledCheckboxProps {
  $size: CheckboxSize;
  $variant: CheckboxVariant;
  $checked: boolean;
  $indeterminate: boolean;
  $disabled: boolean;
}

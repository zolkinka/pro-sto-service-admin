import React from 'react';

/**
 * Размеры радио-кнопки
 */
export type AppRadioSize = 'M' | 'L';

/**
 * Пропсы для компонента AppRadio
 */
export interface AppRadioProps {
  /**
   * Состояние выбора радио-кнопки (controlled)
   */
  checked?: boolean;
  
  /**
   * Состояние неактивности
   */
  disabled?: boolean;
  
  /**
   * Размер радио-кнопки
   * M: 20px диаметр
   * L: 28px диаметр
   * @default 'L'
   */
  size?: AppRadioSize;
  
  /**
   * Имя группы радио-кнопок (для группировки)
   */
  name?: string;
  
  /**
   * Значение радио-кнопки
   */
  value?: string;
  
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
   * Data-атрибут для тестирования
   */
  'data-testid'?: string;
}

/**
 * Styled props для стилизованных компонентов
 */
export interface StyledRadioProps {
  $size: AppRadioSize;
  $disabled: boolean;
  $checked: boolean;
}

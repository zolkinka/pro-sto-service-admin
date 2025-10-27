import React, { forwardRef, useCallback } from 'react';
import AppInput from '../AppInput';
import type { AppNumberInputProps } from './AppNumberInput.types';

/**
 * AppNumberInput - специализированный компонент для ввода числовых значений
 * Задача: 86c65t8dz
 * 
 * Основные возможности:
 * - Ввод только целых чисел (по умолчанию)
 * - Автоматическая фильтрация нечисловых символов
 * - Поддержка min/max ограничений
 * - Все возможности AppInput (label, error, suffix и т.д.)
 */
const AppNumberInput = forwardRef<HTMLInputElement, AppNumberInputProps>(({
  value,
  defaultValue,
  onChange,
  onBlur,
  min,
  max,
  integerOnly = true,
  ...restProps
}, ref) => {
  /**
   * Обработчик изменения значения
   * Фильтрует ТОЛЬКО нецифровые символы в реальном времени
   * НЕ применяет min/max ограничения и форматирование (они применяются только на blur)
   */
  const handleChange = useCallback((newValue: string, event: React.ChangeEvent<HTMLInputElement>) => {
    // Для целых чисел: разрешаем только цифры
    // Не используем parseFloat или другое преобразование - просто фильтруем символы
    const sanitizedValue = integerOnly 
      ? newValue.replace(/[^\d]/g, '')
      : newValue;
    
    // Вызываем callback с отфильтрованным значением
    onChange?.(sanitizedValue, event);
  }, [integerOnly, onChange]);

  /**
   * Обработчик потери фокуса
   * Применяет min/max ограничения и форматирование
   */
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    
    if (currentValue !== '') {
      const numValue = parseFloat(currentValue);
      
      // Проверяем валидность числа
      if (!isNaN(numValue)) {
        let finalValue = numValue;
        
        // Применяем min/max ограничения
        if (min !== undefined && finalValue < min) {
          finalValue = min;
        }
        
        if (max !== undefined && finalValue > max) {
          finalValue = max;
        }
        
        // Если значение изменилось, создаем синтетический onChange event
        if (finalValue !== numValue) {
          const syntheticEvent = {
            ...event,
            target: {
              ...event.target,
              value: finalValue.toString(),
            },
          } as React.ChangeEvent<HTMLInputElement>;
          
          onChange?.(finalValue.toString(), syntheticEvent);
        }
      }
    }
    
    // Вызываем оригинальный onBlur callback
    onBlur?.(event);
  }, [min, max, onChange, onBlur]);

  return (
    <AppInput
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{
        type: 'text', // Используем text вместо number для полного контроля
        inputMode: integerOnly ? 'numeric' : 'decimal', // Подсказка для мобильных клавиатур
        pattern: integerOnly ? '[0-9]*' : '[0-9]*[.,]?[0-9]*',
      }}
      {...restProps}
    />
  );
});

AppNumberInput.displayName = 'AppNumberInput';

export default AppNumberInput;

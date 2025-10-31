import React, { useMemo } from 'react';
import { AppSingleSelect } from '../AppSingleSelect';
import type { SelectOption } from '../AppSingleSelect/AppSingleSelect.types';
import type { AppTimePickerProps } from './AppTimePicker.types';

/**
 * AppTimePicker - Компонент для выбора времени
 * Обёртка над AppSingleSelect с генерацией временных интервалов
 * 
 * @example
 * ```tsx
 * <AppTimePicker
 *   label="Время"
 *   value="14:30"
 *   onChange={(time) => console.log(time)}
 * />
 * ```
 */
const AppTimePicker: React.FC<AppTimePickerProps> = ({
  value = '',
  onChange,
  disabled = false,
  placeholder = 'Выберите время',
  label,
  className,
  availableSlots,
}) => {
  // Генерация списка времени с шагом 15 минут или использование доступных слотов
  const timeOptions: SelectOption[] = useMemo(() => {
    // Если переданы доступные слоты, используем их
    if (availableSlots && availableSlots.length > 0) {
      return availableSlots.map(time => ({
        value: time,
        label: time,
      }));
    }

    // Иначе генерируем все времена с шагом 15 минут
    const times: SelectOption[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        const timeValue = `${h}:${m}`;
        times.push({
          value: timeValue,
          label: timeValue,
        });
      }
    }
    return times;
  }, [availableSlots]);

  // Преобразуем строковое значение в SelectOption
  const selectedOption: SelectOption | null = useMemo(() => {
    if (!value) return null;
    return timeOptions.find(option => option.value === value) || null;
  }, [value, timeOptions]);

  // Обработчик изменения - преобразуем SelectOption обратно в строку
  const handleChange = (option: SelectOption | null) => {
    onChange?.(option?.value as string || '');
  };

  return (
    <AppSingleSelect
      label={label}
      value={selectedOption}
      onChange={handleChange}
      options={timeOptions}
      placeholder={placeholder}
      disabled={disabled}
      clearable={false}
      className={className}
    />
  );
};

export default AppTimePicker;

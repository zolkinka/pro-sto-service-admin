import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { AppInput, type AppInputRef } from '../AppInput';
import { ChevronDownIcon } from '../AppSingleSelect/ChevronDownIcon';
import type { AppTimePickerProps } from './AppTimePicker.types';
import './AppTimePicker.css';

/**
 * AppTimePicker - Компонент для выбора времени с возможностью ручного ввода
 * Поддерживает выбор из списка и ручной ввод с маской HH:MM
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
  placeholder = '00:00',
  label,
  className,
  availableSlots,
  iconLeft,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<AppInputRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Генерация списка времени с шагом 15 минут или использование доступных слотов
  const timeOptions: string[] = useMemo(() => {
    // Если переданы доступные слоты, используем их
    if (availableSlots && availableSlots.length > 0) {
      return availableSlots;
    }

    // Иначе генерируем все времена с шагом 15 минут
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        times.push(`${h}:${m}`);
      }
    }
    return times;
  }, [availableSlots]);

  // Обработчик выбора опции из списка
  const handleSelect = useCallback((time: string) => {
    onChange?.(time);
    setIsOpen(false);
  }, [onChange]);

  // Обработчик изменения инпута (для ручного ввода с маской)
  const handleInputChange = useCallback((newValue: string) => {
    // Маска уже применена в AppInput, просто передаем значение
    onChange?.(newValue);
  }, [onChange]);

  // Обработчик клика по стрелке (открытие/закрытие dropdown)
  const handleArrowClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled) {
      setIsOpen(prev => !prev);
      // Фокусируем input через DOM
      setTimeout(() => {
        const input = containerRef.current?.querySelector('input');
        input?.focus();
      }, 0);
    }
  }, [disabled]);

  // Обработчик фокуса на input (открытие dropdown)
  const handleInputFocus = useCallback(() => {
    if (!disabled && !isOpen) {
      setIsOpen(true);
    }
  }, [disabled, isOpen]);

  // Обработчик клика на контейнер input (открытие dropdown)
  const handleContainerClick = useCallback(() => {
    if (!disabled && !isOpen) {
      setIsOpen(true);
      // Фокусируем input через DOM
      setTimeout(() => {
        const input = containerRef.current?.querySelector('input');
        input?.focus();
      }, 0);
    }
  }, [disabled, isOpen]);

  // Обработчик закрытия dropdown
  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Скролл к выбранному элементу при открытии
  useEffect(() => {
    if (isOpen && value) {
      // Функция для выполнения скролла
      const scrollToSelected = () => {
        if (optionsContainerRef.current) {
          const selectedOption = optionsContainerRef.current.querySelector('.app-time-picker__option_selected');
          if (selectedOption) {
            selectedOption.scrollIntoView({
              block: 'center',
              behavior: 'instant'
            });
            return true;
          }
        }
        return false;
      };

      // Пробуем проскроллить с разными задержками для надежности
      const timeouts: NodeJS.Timeout[] = [];
      [0, 50, 100].forEach(delay => {
        timeouts.push(setTimeout(scrollToSelected, delay));
      });
      
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isOpen, value]);

  // Рендер toggle
  const renderToggle = () => {
    const arrowClassName = classNames('app-time-picker__arrow', {
      'app-time-picker__arrow_open': isOpen,
    });

    return (
      <div className="app-time-picker__input-container" onClick={handleContainerClick} ref={containerRef}>
        <div className="app-time-picker__input-wrapper">
          <AppInput
            ref={inputRef}
            value={value}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            mask="00:00"
            lazy={false}
            placeholderChar="0"
            iconLeft={iconLeft}
          />
          <div 
            className={arrowClassName}
            onMouseDown={handleArrowClick}
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          >
            <ChevronDownIcon color="#B2B1AE" size={20} />
          </div>
        </div>
      </div>
    );
  };

  // Рендер dropdown
  const renderDropdown = useCallback(() => {
    return (
      <div className="app-time-picker__dropdown" role="listbox">
        <div className="app-time-picker__options-container" ref={optionsContainerRef}>
          {timeOptions.map((time) => {
            const optionClassName = classNames('app-time-picker__option', {
              'app-time-picker__option_selected': value === time,
            });

            return (
              <div
                key={time}
                className={optionClassName}
                onClick={() => handleSelect(time)}
                role="option"
                aria-selected={value === time}
              >
                {time}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [timeOptions, value, handleSelect]);

  const wrapperClassName = classNames('app-time-picker', {
    'app-time-picker_disabled': disabled,
  }, className);

  return (
    <div className={wrapperClassName}>
      <AppBaseDropdown
        opened={isOpen}
        onClose={handleDropdownClose}
        toggle={renderToggle()}
        dropdown={renderDropdown()}
        maxDropdownHeight={280}
        noRestrictHeigth={true}
      />
    </div>
  );
};

export default AppTimePicker;

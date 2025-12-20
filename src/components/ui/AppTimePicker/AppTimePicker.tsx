import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { AppInput, type AppInputRef } from '../AppInput';
import { ChevronDownIcon } from '../AppSingleSelect/ChevronDownIcon';
import { usePlatform } from '../../../hooks';
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
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<AppInputRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const platform = usePlatform();
  const isMobileMode = platform === 'mobile';
  const hasSearch = true; // У TimePicker всегда есть поиск (много опций времени)

  // Генерация списка времени с шагом 15 минут или использование доступных слотов
  const timeOptions: string[] = useMemo(() => {
    // Если передан массив доступных слотов (даже пустой), используем его
    // Это позволяет показывать только доступное время
    if (availableSlots !== undefined) {
      return availableSlots;
    }

    // Иначе генерируем все времена с шагом 15 минут (fallback для режима без фильтрации)
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

  // Фильтрация опций по поисковому запросу
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return timeOptions;
    }
    const query = searchQuery.toLowerCase().trim();
    return timeOptions.filter(time => time.includes(query));
  }, [timeOptions, searchQuery]);

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

  // Валидация и корректировка времени
  const validateAndCorrectTime = useCallback((timeValue: string): string => {
    // Если поле пустое или некорректного формата - очищаем
    if (!timeValue || timeValue.trim() === '') {
      return '';
    }

    // Парсим часы и минуты
    const parts = timeValue.split(':');
    if (parts.length !== 2) {
      return ''; // Некорректный формат - очищаем
    }

    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);

    // Проверяем на NaN
    if (isNaN(hours) || isNaN(minutes)) {
      return '';
    }

    // Корректируем часы (если больше 23, сбрасываем до 23)
    if (hours > 23) {
      hours = 23;
    }

    // Корректируем минуты (если больше 59, сбрасываем до 59)
    if (minutes > 59) {
      minutes = 59;
    }

    // Форматируем обратно в строку
    const correctedHours = hours.toString().padStart(2, '0');
    const correctedMinutes = minutes.toString().padStart(2, '0');
    
    return `${correctedHours}:${correctedMinutes}`;
  }, []);

  // Обработчик потери фокуса - валидируем время
  const handleInputBlur = useCallback(() => {
    if (value) {
      const correctedValue = validateAndCorrectTime(value);
      if (correctedValue !== value) {
        onChange?.(correctedValue);
      }
    }
  }, [value, onChange, validateAndCorrectTime]);

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

  // Очистка searchQuery когда value сбрасывается извне
  useEffect(() => {
    // Если value пустое, очищаем поисковый запрос
    if (!value || value === '') {
      setSearchQuery('');
    }
  }, [value]);

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

    const hasError = Boolean(error);
    const errorMessage = error;

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
            onBlur={handleInputBlur}
            mask="00:00"
            lazy={true}
            placeholderChar="0"
            iconLeft={iconLeft}
            error={hasError}
          />
          {errorMessage && (
            <span
              className="app-time-picker__error-icon"
              role="img"
              aria-label={errorMessage}
              title={errorMessage}
            />
          )}
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
          {timeOptions.length > 0 ? (
            timeOptions.map((time) => {
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
            })
          ) : (
            <div className="app-time-picker__no-options">
              Нет доступного времени
            </div>
          )}
        </div>
      </div>
    );
  }, [timeOptions, value, handleSelect]);

  // Рендер мобильного дровера
  const renderMobileDrawer = () => {
    // Определяем текст для пустого состояния
    const getEmptyMessage = () => {
      if (timeOptions.length === 0) {
        return 'Нет доступного времени';
      }
      return 'Ничего не найдено';
    };

    return (
      <div className="app-time-picker__mobile-drawer">
        {hasSearch && (
          <div className="app-time-picker__mobile-search">
            <AppInput
              value={searchQuery}
              placeholder="Поиск..."
              onChange={setSearchQuery}
              autoComplete="off"
              autoFocus
            />
          </div>
        )}
        <div className="app-time-picker__mobile-options">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((time) => {
              const isSelected = value === time;
              const optionClassName = classNames('app-time-picker__mobile-option', {
                'app-time-picker__mobile-option_selected': isSelected,
              });

              return (
                <div
                  key={time}
                  className={optionClassName}
                  onClick={() => handleSelect(time)}
                >
                  <span>{time}</span>
                  {isSelected && <span className="app-time-picker__mobile-option-check">✓</span>}
                </div>
              );
            })
          ) : (
            <div className="app-time-picker__mobile-no-options">
              {getEmptyMessage()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const wrapperClassName = classNames('app-time-picker', {
    'app-time-picker_disabled': disabled,
    'app-time-picker_error': !!error,
  }, className);

  return (
    <div className={wrapperClassName}>
      <AppBaseDropdown
        opened={isOpen}
        onClose={handleDropdownClose}
        toggle={renderToggle()}
        dropdown={isMobileMode ? renderMobileDrawer() : renderDropdown()}
        maxDropdownHeight={280}
        mobileDrawerMaxHeight="66.67vh"
        mobileDrawerFixedHeight={hasSearch}
        noRestrictHeigth={true}
      />
    </div>
  );
};

export default AppTimePicker;

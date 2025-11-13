import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { MobileDrawerContent } from '../AppBaseDropdown/MobileDrawerContent';
import AppInput from '../AppInput/AppInput';
import type { AppDatePickerProps } from './AppDatePicker.types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import {
  formatDateToDDMMYYYY,
  formatMonthYear,
  generateCalendarGrid,
  getWeekDays,
  isDateDisabled,
  isSameDay,
  parseDate,
} from './utils';
import { usePlatform } from '@/hooks/usePlatform';
import './AppDatePicker.css';

/**
 * AppDatePicker - Компонент для выбора даты с календарным интерфейсом
 * 
 * @example
 * ```tsx
 * <AppDatePicker
 *   label="Дата"
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   minDate={new Date()}
 * />
 * ```
 */
export const AppDatePicker: React.FC<AppDatePickerProps> = ({
  value,
  label = 'Время и дата',
  placeholder = 'Дата',
  disabled = false,
  error,
  required = false,
  minDate,
  maxDate,
  disabledDates,
  locale = 'ru',
  className,
  baseDropdownProps = {},
  onChange,
  'data-testid': dataTestId,
}) => {
  const platform = usePlatform();
  const isMobile = platform === 'mobile';
  
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  
  // Парсим входящее значение
  const selectedDate = useMemo(() => parseDate(value), [value]);
  
  // Состояние для отображаемого месяца в календаре
  const [viewDate, setViewDate] = useState<Date>(() => {
    return selectedDate || new Date();
  });

  // Генерируем сетку календаря
  const calendarGrid = useMemo(() => {
    return generateCalendarGrid(viewDate.getFullYear(), viewDate.getMonth());
  }, [viewDate]);

  // Получаем локализованные дни недели
  const weekDays = useMemo(() => getWeekDays(locale), [locale]);

  // Форматируем выбранную дату для отображения в input
  const formattedValue = useMemo(() => {
    return formatDateToDDMMYYYY(selectedDate);
  }, [selectedDate]);

  // Форматируем заголовок месяца
  const monthYearTitle = useMemo(() => {
    return formatMonthYear(viewDate, locale);
  }, [viewDate, locale]);

  // Обработчик выбора даты
  const handleDateSelect = useCallback((date: Date) => {
    // Проверяем, не отключена ли дата
    if (isDateDisabled(date, minDate, maxDate, disabledDates)) {
      return;
    }
    
    if (isMobile) {
      // На мобильных сохраняем временное значение
      setTempDate(date);
    } else {
      // На desktop сразу применяем
      onChange?.(date);
      setIsOpen(false);
    }
  }, [onChange, minDate, maxDate, disabledDates, isMobile]);

  // Обработчик закрытия dropdown
  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
    setTempDate(null);
  }, []);
  
  // Подтверждение выбора даты на мобильных
  const handleConfirm = useCallback(() => {
    if (tempDate) {
      onChange?.(tempDate);
    }
    setIsOpen(false);
    setTempDate(null);
  }, [tempDate, onChange]);
  
  // Отмена выбора на мобильных
  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setTempDate(null);
  }, []);
  
  // Обработчик клика по input (открытие календаря)
  const handleInputClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  // Навигация на предыдущий месяц
  const handlePrevMonth = useCallback(() => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  // Навигация на следующий месяц
  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  // Рендер toggle (input с иконкой календаря)
  const renderToggle = () => {
    return (
      <div className="app-date-picker__input-container" onClick={handleInputClick}>
        <AppInput
          value={formattedValue}
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          required={required}
          readOnly
          iconLeft={<CalendarIcon color="#302F2D" size={20} />}
        />
      </div>
    );
  };

  // Рендер календаря
  const renderCalendar = () => {
    // Используем tempDate для отображения выделенной даты на мобильных
    const displayedSelectedDate = isMobile ? tempDate : selectedDate;
    
    const calendarContent = (
      <div className="app-date-picker__calendar">
        {/* Заголовок с навигацией */}
        <div className="app-date-picker__header">
          <button
            type="button"
            className="app-date-picker__nav-button"
            onClick={handlePrevMonth}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeftIcon color="#302F2D" size={20} />
          </button>
          <div className="app-date-picker__month-title">
            {monthYearTitle}
          </div>
          <button
            type="button"
            className="app-date-picker__nav-button"
            onClick={handleNextMonth}
            aria-label="Следующий месяц"
          >
            <ChevronRightIcon color="#302F2D" size={20} />
          </button>
        </div>

        {/* Дни недели */}
        <div className="app-date-picker__weekdays">
          {weekDays.map((day) => (
            <div key={day} className="app-date-picker__weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Сетка дат */}
        <div className="app-date-picker__grid">
          {calendarGrid.map((week, weekIndex) => (
            <div key={weekIndex} className="app-date-picker__week">
              {week.map((cell) => {
                const isSelected = isSameDay(cell.date, displayedSelectedDate);
                const isDisabled = isDateDisabled(
                  cell.date,
                  minDate,
                  maxDate,
                  disabledDates
                );

                const cellClassName = classNames('app-date-picker__day', {
                  'app-date-picker__day_current-month': cell.isCurrentMonth,
                  'app-date-picker__day_other-month': !cell.isCurrentMonth,
                  'app-date-picker__day_selected': isSelected,
                  'app-date-picker__day_today': cell.isToday,
                  'app-date-picker__day_disabled': isDisabled,
                });

                return (
                  <button
                    key={cell.date.toISOString()}
                    type="button"
                    className={cellClassName}
                    onClick={() => handleDateSelect(cell.date)}
                    disabled={isDisabled}
                    aria-label={formatDateToDDMMYYYY(cell.date)}
                    aria-selected={isSelected}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
    
    // На мобильных оборачиваем в MobileDrawerContent с кнопками
    if (isMobile) {
      return (
        <MobileDrawerContent
          showFooter
          cancelText="Отмена"
          confirmText="Добавить"
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        >
          {calendarContent}
        </MobileDrawerContent>
      );
    }
    
    return calendarContent;
  };

  const wrapperClassName = classNames('app-date-picker', {
    'app-date-picker_disabled': disabled,
  }, className);

  return (
    <div className={wrapperClassName} data-testid={dataTestId}>
      <AppBaseDropdown
        {...baseDropdownProps}
        opened={isOpen}
        onClose={handleDropdownClose}
        toggle={renderToggle()}
        dropdown={renderCalendar()}
        dropdownWidth="none"
        maxDropdownHeight={400}
        noRestrictHeigth={false}
      />
    </div>
  );
};

AppDatePicker.displayName = 'AppDatePicker';

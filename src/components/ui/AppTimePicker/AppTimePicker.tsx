import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import type { AppTimePickerProps } from './AppTimePicker.types';
import './AppTimePicker.css';

const AppTimePicker: React.FC<AppTimePickerProps> = ({
  value = '',
  onChange,
  disabled = false,
  placeholder = 'Выберите время',
  className,
  'data-testid': dataTestId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Генерация списка времени с шагом 15 минут
  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        times.push(`${h}:${m}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    setSelectedTime(value);
  }, [value]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Скролл к выбранному времени при открытии
  useEffect(() => {
    if (isOpen && selectedTime) {
      const optionElement = dropdownRef.current?.querySelector(
        `[data-time="${selectedTime}"]`
      );
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, selectedTime]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onChange?.(time);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const wrapperClasses = classNames(
    'app-time-picker',
    {
      'app-time-picker_disabled': disabled,
      'app-time-picker_open': isOpen,
    },
    className
  );

  const inputClasses = classNames('app-time-picker__input', {
    'app-time-picker__input_disabled': disabled,
    'app-time-picker__input_filled': selectedTime,
  });

  return (
    <div className={wrapperClasses} ref={dropdownRef} data-testid={dataTestId}>
      <input
        ref={inputRef}
        type="text"
        className={inputClasses}
        value={selectedTime}
        placeholder={placeholder}
        onClick={handleInputClick}
        readOnly
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      />
      
      {isOpen && !disabled && (
        <div className="app-time-picker__dropdown" role="listbox">
          {timeOptions.map((time) => (
            <div
              key={time}
              data-time={time}
              className={classNames('app-time-picker__option', {
                'app-time-picker__option_selected': time === selectedTime,
              })}
              onClick={() => handleTimeSelect(time)}
              role="option"
              aria-selected={time === selectedTime}
            >
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppTimePicker;

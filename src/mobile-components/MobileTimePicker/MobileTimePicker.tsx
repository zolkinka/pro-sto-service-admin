import React, { useState, useMemo } from 'react';
import { AppBaseDropdown } from '@/components/ui/AppBaseDropdown';
import './MobileTimePicker.css';

export interface MobileTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  'data-testid'?: string;
}

const MobileTimePicker: React.FC<MobileTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  label,
  'data-testid': dataTestId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Генерация списка времени с шагом 15 минут
  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        options.push(`${hourStr}:${minuteStr}`);
      }
    }
    return options;
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const toggle = (
    <div
      className={`mobile-time-picker__input ${disabled ? 'mobile-time-picker__input_disabled' : ''} ${isOpen ? 'mobile-time-picker__input_open' : ''}`}
      onClick={handleToggle}
    >
      <svg
        className="mobile-time-picker__icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 5.83333V10L12.5 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 16.6667C13.6819 16.6667 16.6667 13.6819 16.6667 10C16.6667 6.31811 13.6819 3.33334 10 3.33334C6.31814 3.33334 3.33337 6.31811 3.33337 10C3.33337 13.6819 6.31814 16.6667 10 16.6667Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span className="mobile-time-picker__value">{value || '00:00'}</span>
    </div>
  );

  const dropdown = (
    <div className="mobile-time-picker__list">
      {timeOptions.map((time) => (
        <button
          key={time}
          className={`mobile-time-picker__option ${time === value ? 'mobile-time-picker__option_selected' : ''}`}
          onClick={() => handleSelect(time)}
          type="button"
        >
          {time}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mobile-time-picker" data-testid={dataTestId}>
      {label && <label className="mobile-time-picker__label">{label}</label>}
      
      <AppBaseDropdown
        opened={isOpen}
        onClose={handleClose}
        toggle={toggle}
        dropdown={dropdown}
        dropdownWidth="equal-toggle"
        yDirection="free-space"
        xDirection="left"
        maxDropdownHeight={240}
      />
    </div>
  );
};

export default MobileTimePicker;

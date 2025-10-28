import React, { useId } from 'react';
import classNames from 'classnames';
import type { AppRadioProps } from './AppRadio.types';
import './AppRadio.css';

/**
 * Компонент радио-кнопки
 */
const AppRadio: React.FC<AppRadioProps> = ({
  checked = false,
  disabled = false,
  size = 'L',
  name,
  value,
  onChange,
  label,
  className,
  'data-testid': dataTestId,
}) => {
  // Генерируем уникальный ID для связи input и label
  const generatedId = useId();
  const inputId = `app-radio-${generatedId}`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onChange?.(event);
  };

  const wrapperClasses = classNames(
    'app-radio',
    {
      'app-radio_disabled': disabled,
    },
    className
  );

  const circleClasses = classNames(
    'app-radio__circle',
    `app-radio__circle_size_${size}`,
    {
      'app-radio__circle_disabled': disabled,
    }
  );

  const indicatorClasses = classNames(
    'app-radio__indicator',
    `app-radio__indicator_size_${size}`,
    {
      'app-radio__indicator_checked': checked,
      'app-radio__indicator_disabled': disabled,
    }
  );

  const labelClasses = classNames(
    'app-radio__label',
    {
      'app-radio__label_disabled': disabled,
    }
  );

  return (
    <label
      htmlFor={inputId}
      className={wrapperClasses}
      data-testid={dataTestId}
    >
      <input
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        aria-checked={checked}
        aria-disabled={disabled}
        className="app-radio__input"
      />
      
      <span className={circleClasses}>
        <span className={indicatorClasses} />
      </span>
      
      {label && (
        <span className={labelClasses}>
          {label}
        </span>
      )}
    </label>
  );
};

export default AppRadio;

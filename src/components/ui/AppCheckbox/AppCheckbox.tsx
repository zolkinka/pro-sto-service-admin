import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { AppCheckboxProps } from './AppCheckbox.types';
import './AppCheckbox.css';

/**
 * Компонент AppCheckbox
 */
const AppCheckbox: React.FC<AppCheckboxProps> = ({
  checked: controlledChecked,
  indeterminate = false,
  disabled = false,
  size = 'M',
  variant = 'primary',
  onChange,
  label,
  className,
  'data-testid': dataTestId,
}) => {
  // Внутреннее состояние для uncontrolled режима
  const [internalChecked, setInternalChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Определяем, является ли компонент controlled или uncontrolled
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;
  
  // Устанавливаем indeterminate через ref (невозможно через атрибут)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  // Обработчик изменения
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    if (!isControlled) {
      setInternalChecked(event.target.checked);
    }
    
    onChange?.(event);
  };
  
  // Обработчик клавиатуры
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // Space для переключения (Enter уже работает с label)
    if (event.key === ' ') {
      event.preventDefault();
      if (inputRef.current) {
        inputRef.current.click();
      }
    }
  };

  const wrapperClasses = classNames(
    'app-checkbox',
    {
      'app-checkbox_disabled': disabled,
    },
    className
  );

  const boxClasses = classNames(
    'app-checkbox__box',
    `app-checkbox__box_size_${size}`,
    `app-checkbox__box_variant_${variant}`,
    {
      'app-checkbox__box_checked': checked,
      'app-checkbox__box_indeterminate': indeterminate,
      'app-checkbox__box_disabled': disabled,
    }
  );

  const iconClasses = classNames(
    'app-checkbox__icon',
    `app-checkbox__icon_size_${size}`,
    `app-checkbox__icon_variant_${variant}`,
    {
      'app-checkbox__icon_disabled': disabled,
    }
  );

  const labelClasses = classNames(
    'app-checkbox__label',
    `app-checkbox__label_size_${size}`,
    `app-checkbox__label_variant_${variant}`,
    {
      'app-checkbox__label_disabled': disabled,
    }
  );

  return (
    <label
      className={wrapperClasses}
      data-testid={dataTestId}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
        role="checkbox"
        className="app-checkbox__input"
      />
      
      <span className={boxClasses}>
        {indeterminate ? (
          <div className={iconClasses} style={{ 
            width: size === 'S' ? '10px' : '12px',
            height: '2px',
            borderRadius: '1px',
            backgroundColor: 'currentColor',
          }} />
        ) : checked && (
          <svg
            className={iconClasses}
            viewBox="0 0 16 16"
          >
            <polyline points="3,8 6,11 13,4" />
          </svg>
        )}
      </span>
      
      {label && (
        <span className={labelClasses}>
          {label}
        </span>
      )}
    </label>
  );
};

export default AppCheckbox;

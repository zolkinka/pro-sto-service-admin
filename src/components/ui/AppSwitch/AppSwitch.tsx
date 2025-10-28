import React, { useState } from 'react';
import classNames from 'classnames';
import type { AppSwitchProps } from './AppSwitch.types';
import './AppSwitch.css';

// Основной компонент
const AppSwitch: React.FC<AppSwitchProps> = ({
  checked: controlledChecked,
  disabled = false,
  size = 'L',
  onChange,
  label,
  className,
  'data-testid': dataTestId,
}) => {
  // Внутреннее состояние для uncontrolled режима
  const [internalChecked, setInternalChecked] = useState(false);
  
  // Определяем, является ли компонент controlled или uncontrolled
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;
  
  // Обработчик переключения
  const handleToggle = () => {
    if (disabled) return;
    
    const newChecked = !checked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked);
  };
  
  // Обработчик клавиатуры
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    // Space или Enter для переключения
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleToggle();
    }
  };

  const wrapperClasses = classNames(
    'app-switch',
    {
      'app-switch_disabled': disabled,
    },
    className
  );

  const trackClasses = classNames(
    'app-switch__track',
    `app-switch__track_size_${size}`,
    {
      'app-switch__track_checked': checked,
      'app-switch__track_disabled': disabled,
    }
  );

  const thumbClasses = classNames(
    'app-switch__thumb',
    `app-switch__thumb_size_${size}`,
    {
      'app-switch__thumb_checked': checked,
    }
  );

  const labelClasses = classNames(
    'app-switch__label',
    {
      'app-switch__label_disabled': disabled,
    }
  );

  return (
    <label 
      className={wrapperClasses}
      data-testid={dataTestId}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleToggle}
        onKeyDown={handleKeyDown}
        aria-checked={checked}
        role="switch"
        tabIndex={disabled ? -1 : 0}
        className="app-switch__input"
      />
      
      <div
        className={trackClasses}
        role="presentation"
        aria-hidden="true"
      >
        <div className={thumbClasses} />
      </div>
      
      {label && (
        <span className={labelClasses}>
          {label}
        </span>
      )}
    </label>
  );
};

export default AppSwitch;

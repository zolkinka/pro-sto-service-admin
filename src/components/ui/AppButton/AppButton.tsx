import React from 'react';
import classNames from 'classnames';
import type { AppButtonProps } from './AppButton.types';
import './AppButton.css';

// Основной компонент
const AppButton: React.FC<AppButtonProps> = ({
  children,
  size = 'L',
  variant = 'primary',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  onlyIcon = false,
  onClick,
  type = 'button',
  className,
  'data-testid': dataTestId,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const buttonClasses = classNames(
    'app-button',
    `app-button_size_${size}`,
    `app-button_variant_${variant}`,
    {
      'app-button_disabled': disabled,
      'app-button_loading': loading,
      'app-button_only-icon': onlyIcon,
    },
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      data-testid={dataTestId}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <div className="app-button__spinner" />}
      
      {!loading && !onlyIcon && iconLeft && (
        <span className="app-button__icon">
          {iconLeft}
        </span>
      )}
      
      {!onlyIcon && children && (
        <span>{children}</span>
      )}
      
      {!loading && !onlyIcon && iconRight && (
        <span className="app-button__icon">
          {iconRight}
        </span>
      )}
      
      {onlyIcon && !loading && (iconLeft || iconRight) && (
        <span className="app-button__icon">
          {iconLeft || iconRight}
        </span>
      )}
    </button>
  );
};

export default AppButton;
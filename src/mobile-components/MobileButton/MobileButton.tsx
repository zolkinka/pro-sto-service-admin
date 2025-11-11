import React from 'react';
import classNames from 'classnames';
import './MobileButton.css';

export interface MobileButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
}

const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  onClick,
  type = 'button',
  'data-testid': dataTestId,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const buttonClasses = classNames(
    'mobile-button',
    `mobile-button_variant_${variant}`,
    {
      'mobile-button_disabled': disabled,
      'mobile-button_loading': loading,
      'mobile-button_full-width': fullWidth,
    }
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
    >
      {loading && <div className="mobile-button__spinner" />}
      {!loading && children}
    </button>
  );
};

export default MobileButton;

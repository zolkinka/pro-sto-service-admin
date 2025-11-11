import React from 'react';
import classNames from 'classnames';
import './MobileErrorMessage.css';

export interface MobileErrorMessageProps {
  message: string;
  visible?: boolean;
  'data-testid'?: string;
}

const MobileErrorMessage: React.FC<MobileErrorMessageProps> = ({
  message,
  visible = true,
  'data-testid': dataTestId,
}) => {
  if (!visible || !message) return null;

  const errorClasses = classNames('mobile-error-message');

  return (
    <div className={errorClasses} data-testid={dataTestId} role="alert">
      {message}
    </div>
  );
};

export default MobileErrorMessage;

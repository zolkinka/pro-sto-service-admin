import React, { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';
import type { AppToastProps } from './AppToast.types';
import './AppToast.css';

// Иконки для разных типов уведомлений
const SuccessIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8.33" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ErrorIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8.33" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="15" r="1" fill="currentColor" />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8.33" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="7" r="1" fill="currentColor" />
  </svg>
);

const WarningIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L18 17H2L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="14.5" r="0.5" fill="currentColor" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Основной компонент
const AppToast: React.FC<AppToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  closable = true,
  onClose,
  className,
  position = 'top-right',
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    // Даем время на анимацию выхода
    setTimeout(() => {
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (duration === 0) return;

    let timeoutId: NodeJS.Timeout;
    let startTime = Date.now();
    let remainingTime = duration;

    const scheduleClose = () => {
      timeoutId = setTimeout(() => {
        handleClose();
      }, remainingTime);
    };

    scheduleClose();

    const handlePause = () => {
      if (!isPaused) {
        clearTimeout(timeoutId);
        remainingTime -= Date.now() - startTime;
        setIsPaused(true);
      }
    };

    const handleResume = () => {
      if (isPaused) {
        startTime = Date.now();
        scheduleClose();
        setIsPaused(false);
      }
    };

    const toastElement = document.getElementById(`toast-${id}`);
    if (toastElement) {
      toastElement.addEventListener('mouseenter', handlePause);
      toastElement.addEventListener('mouseleave', handleResume);
    }

    return () => {
      clearTimeout(timeoutId);
      if (toastElement) {
        toastElement.removeEventListener('mouseenter', handlePause);
        toastElement.removeEventListener('mouseleave', handleResume);
      }
    };
  }, [id, duration, isPaused, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'info':
        return <InfoIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const toastClassName = classNames(
    'app-toast',
    `app-toast_type_${type}`,
    `app-toast_position_${position}`,
    {
      'app-toast_exiting': isExiting,
    },
    className
  );

  const progressClassName = classNames('app-toast__progress', {
    'app-toast__progress_paused': isPaused,
  });

  const progressStyle = duration > 0 ? { animationDuration: `${duration}ms` } : undefined;

  return (
    <div
      id={`toast-${id}`}
      className={toastClassName}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="app-toast__icon">{getIcon()}</div>
      
      <div className="app-toast__content">
        {title && <div className="app-toast__title">{title}</div>}
        <div className="app-toast__message">{message}</div>
      </div>
      
      {closable && (
        <button
          className="app-toast__close"
          onClick={handleClose}
          aria-label="Закрыть уведомление"
          type="button"
        >
          <CloseIcon />
        </button>
      )}
      
      {duration > 0 && (
        <div className={progressClassName} style={progressStyle} />
      )}
    </div>
  );
};

export default AppToast;

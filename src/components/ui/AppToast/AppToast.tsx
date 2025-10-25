import React, { useEffect, useState, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import type { AppToastProps, StyledToastProps, StyledProgressBarProps } from './AppToast.types';

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

// Анимации
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const slideOutLeft = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const progressAnimation = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

// Получение стилей для разных типов
const getToastStyles = (type: string, theme: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const styles = {
    success: css`
      background-color: ${theme.colors.green[25]};
      color: ${theme.colors.green[400]};
      border-left: 4px solid ${theme.colors.green[400]};
    `,
    error: css`
      background-color: ${theme.colors.error[25]};
      color: ${theme.colors.error[300]};
      border-left: 4px solid ${theme.colors.error[300]};
    `,
    info: css`
      background-color: #EEF2FE;
      color: ${theme.colors.blue[500]};
      border-left: 4px solid ${theme.colors.blue[500]};
    `,
    warning: css`
      background-color: #FEF5E7;
      color: ${theme.colors.yellow[500]};
      border-left: 4px solid ${theme.colors.yellow[500]};
    `,
  };
  
  return styles[type as keyof typeof styles] || styles.info;
};

// Получение анимации входа в зависимости от позиции
const getEnterAnimation = (position: string) => {
  if (position.includes('right')) {
    return css`animation: ${slideInRight} 0.3s ease-out forwards;`;
  }
  return css`animation: ${slideInLeft} 0.3s ease-out forwards;`;
};

// Получение анимации выхода в зависимости от позиции
const getExitAnimation = (position: string) => {
  if (position.includes('right')) {
    return css`animation: ${slideOutRight} 0.3s ease-in forwards;`;
  }
  return css`animation: ${slideOutLeft} 0.3s ease-in forwards;`;
};

// Стили
const ToastContainer = styled.div<StyledToastProps>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 320px;
  max-width: 420px;
  position: relative;
  overflow: hidden;
  font-family: ${({ theme }) => theme.fonts.onest};
  
  ${({ $type, theme }) => getToastStyles($type, theme)}
  
  ${({ $isExiting, $position }) => 
    $isExiting 
      ? getExitAnimation($position)
      : getEnterAnimation($position)
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-width: 280px;
    max-width: calc(100vw - 32px);
  }
`;

const IconContainer = styled.div`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Title = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  line-height: 1.2;
  word-wrap: break-word;
`;

const Message = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.normal};
  line-height: 1.2;
  word-wrap: break-word;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  color: currentColor;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  margin-top: 2px;
  
  &:hover {
    opacity: 1;
  }
  
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const ProgressBar = styled.div<StyledProgressBarProps>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: currentColor;
  opacity: 0.3;
  
  ${({ $duration, $isPaused }) => 
    $duration > 0 && css`
      animation: ${progressAnimation} ${$duration}ms linear forwards;
      animation-play-state: ${$isPaused ? 'paused' : 'running'};
    `
  }
`;

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

  return (
    <ToastContainer
      id={`toast-${id}`}
      className={className}
      $type={type}
      $isExiting={isExiting}
      $position={position}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <IconContainer>{getIcon()}</IconContainer>
      
      <Content>
        {title && <Title>{title}</Title>}
        <Message>{message}</Message>
      </Content>
      
      {closable && (
        <CloseButton
          onClick={handleClose}
          aria-label="Закрыть уведомление"
          type="button"
        >
          <CloseIcon />
        </CloseButton>
      )}
      
      {duration > 0 && (
        <ProgressBar
          $duration={duration}
          $isPaused={isPaused}
          $type={type}
        />
      )}
    </ToastContainer>
  );
};

export default AppToast;

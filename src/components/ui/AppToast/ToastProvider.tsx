import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import AppToast from './AppToast';
import { ToastContext } from './ToastContext';
import type { 
  ToastProviderProps, 
  ToastContextType, 
  ToastConfig, 
  AppToastProps,
  ToastPosition 
} from './AppToast.types';

// Стили для контейнера toast'ов
const getPositionStyles = (position: ToastPosition) => {
  const positions = {
    'top-right': `
      top: 16px;
      right: 16px;
    `,
    'top-left': `
      top: 16px;
      left: 16px;
    `,
    'bottom-right': `
      bottom: 16px;
      right: 16px;
    `,
    'bottom-left': `
      bottom: 16px;
      left: 16px;
    `,
  };
  
  return positions[position];
};

const ToastContainerStyled = styled.div<{ $position: ToastPosition }>`
  position: fixed;
  ${({ $position }) => getPositionStyles($position)}
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    left: 16px;
    right: 16px;
    max-width: calc(100vw - 32px);
  }
`;

// Provider компонент
export const ToastProvider: React.FC<ToastProviderProps> = ({
  position = 'top-right',
  maxToasts = 5,
  children,
}) => {
  const [toasts, setToasts] = useState<AppToastProps[]>([]);

  // Функция для скрытия конкретного toast
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Функция для показа toast
  const showToast = useCallback((config: ToastConfig): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newToast: AppToastProps = {
      id,
      type: config.type,
      title: config.title,
      message: config.message,
      duration: config.duration ?? 4000,
      closable: config.closable ?? true,
      position,
      onClose: () => {
        hideToast(id);
        config.onClose?.();
      },
    };
    
    setToasts(prev => {
      // Ограничиваем количество toast'ов
      const updated = [...prev, newToast];
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts);
      }
      return updated;
    });
    
    return id;
  }, [position, maxToasts, hideToast]);

  // Функция для скрытия всех toast'ов
  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    hideAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <ToastContainerStyled $position={position}>
          {toasts.map(toast => (
            <AppToast key={toast.id} {...toast} />
          ))}
        </ToastContainerStyled>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

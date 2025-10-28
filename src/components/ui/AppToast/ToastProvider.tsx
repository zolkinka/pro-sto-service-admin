import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import AppToast from './AppToast';
import { ToastContext } from './ToastContext';
import type { 
  ToastProviderProps, 
  ToastContextType, 
  ToastConfig, 
  AppToastProps
} from './AppToast.types';
import './ToastProvider.css';

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

  const containerClassName = classNames(
    'toast-container',
    `toast-container_position_${position}`
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div className={containerClassName}>
          {toasts.map(toast => (
            <AppToast key={toast.id} {...toast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

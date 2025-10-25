export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface AppToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, 0 = не закрывать автоматически
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  position?: ToastPosition;
}

export interface ToastProviderProps {
  position?: ToastPosition;
  maxToasts?: number;
  children: React.ReactNode;
}

export interface ToastConfig {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
}

export interface ToastContextType {
  showToast: (config: ToastConfig) => string;
  hideToast: (id: string) => void;
  hideAll: () => void;
}

export interface StyledToastProps {
  $type: ToastType;
  $isExiting: boolean;
  $position: ToastPosition;
}

export interface StyledProgressBarProps {
  $duration: number;
  $isPaused: boolean;
  $type: ToastType;
}

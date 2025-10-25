import { createContext } from 'react';
import type { ToastContextType } from './AppToast.types';

export const ToastContext = createContext<ToastContextType | null>(null);

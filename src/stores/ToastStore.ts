import { makeAutoObservable } from 'mobx';
import type { ToastConfig } from '@/components/ui/AppToast';

/**
 * MobX-совместимый store для управления toast уведомлениями
 * Служит мостом между MobX stores и React Context (useToast)
 * 
 * IMPORTANT: Этот store НЕ управляет состоянием напрямую.
 * Фактическое управление toast'ами происходит через ToastProvider.
 * Этот store только хранит ссылку на функции из useToast хука.
 */
export class ToastStore {
  // Ссылка на функцию showToast из useToast хука
  private showToastFn: ((config: ToastConfig) => string) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Инициализация store с функциями из useToast
   * Должна быть вызвана один раз при монтировании App
   */
  initialize(showToast: (config: ToastConfig) => string) {
    this.showToastFn = showToast;
  }

  /**
   * Показать toast с ошибкой
   */
  showError(message: string, title: string = 'Ошибка') {
    if (!this.showToastFn) {
      console.error('ToastStore не инициализирован. Вызовите initialize() перед использованием.');
      return;
    }

    this.showToastFn({
      type: 'error',
      title,
      message,
      duration: 4000,
      closable: true,
    });
  }

  /**
   * Показать toast с успехом
   */
  showSuccess(message: string, title: string = 'Успешно') {
    if (!this.showToastFn) {
      console.error('ToastStore не инициализирован. Вызовите initialize() перед использованием.');
      return;
    }

    this.showToastFn({
      type: 'success',
      title,
      message,
      duration: 4000,
      closable: true,
    });
  }

  /**
   * Показать информационный toast
   */
  showInfo(message: string, title?: string) {
    if (!this.showToastFn) {
      console.error('ToastStore не инициализирован. Вызовите initialize() перед использованием.');
      return;
    }

    this.showToastFn({
      type: 'info',
      title,
      message,
      duration: 4000,
      closable: true,
    });
  }

  /**
   * Показать предупреждающий toast
   */
  showWarning(message: string, title: string = 'Внимание') {
    if (!this.showToastFn) {
      console.error('ToastStore не инициализирован. Вызовите initialize() перед использованием.');
      return;
    }

    this.showToastFn({
      type: 'warning',
      title,
      message,
      duration: 4000,
      closable: true,
    });
  }
}

// Экспортируем singleton instance
export const toastStore = new ToastStore();

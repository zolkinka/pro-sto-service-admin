export interface AppCodeInputProps {
  /**
   * Длина кода (по умолчанию 4)
   */
  length?: number;

  /**
   * Callback при завершении ввода кода
   */
  onComplete?: (code: string) => void;

  /**
   * Callback при изменении значения
   */
  onChange?: (code: string) => void;

  /**
   * Ошибка валидации
   */
  error?: string | boolean;

  /**
   * Текст ошибки
   */
  errorText?: string;

  /**
   * Label над полями
   */
  label?: string;

  /**
   * Disabled состояние
   */
  disabled?: boolean;

  /**
   * Автофокус при монтировании
   */
  autoFocus?: boolean;

  /**
   * Тип клавиатуры на мобильных
   */
  inputMode?: 'numeric' | 'tel';

  /**
   * data-testid для тестирования
   */
  'data-testid'?: string;
}

export interface UseCodeInputOptions {
  length: number;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
}

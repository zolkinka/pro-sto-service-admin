import { useState, useRef, useEffect } from 'react';
import type { UseCodeInputOptions } from '../AppCodeInput.types';

export const useCodeInput = ({
  length,
  autoFocus = true,
  onComplete,
  onChange,
}: UseCodeInputOptions) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Автофокус на первое поле
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, value: string) => {
    // Разрешаем только цифры
    const digit = value.replace(/\D/g, '').slice(0, 1);

    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    // Callback onChange
    const code = newValues.join('');
    onChange?.(code);

    // Автопереход к следующему полю
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Callback onComplete если все заполнено
    if (newValues.every((v) => v !== '') && newValues.length === length) {
      onComplete?.(newValues.join(''));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Backspace - переход к предыдущему полю
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Стрелки влево/вправо для навигации
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);

    if (digits.length > 0) {
      const newValues = Array(length).fill('');
      digits.split('').forEach((digit, i) => {
        newValues[i] = digit;
      });
      setValues(newValues);

      // Фокус на последнее заполненное поле
      const lastFilledIndex = Math.min(digits.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();

      // Callback
      const code = newValues.join('');
      onChange?.(code);

      if (digits.length === length) {
        onComplete?.(code);
      }
    }
  };

  const reset = () => {
    setValues(Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return {
    values,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    reset,
  };
};

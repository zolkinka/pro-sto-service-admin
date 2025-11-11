import React from 'react';
import classNames from 'classnames';
import './MobileCodeInput.css';

export interface MobileCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  'data-testid'?: string;
}

const MobileCodeInput: React.FC<MobileCodeInputProps> = ({
  length = 4,
  value,
  onChange,
  onComplete,
  error,
  label,
  disabled = false,
  autoFocus = true,
  'data-testid': dataTestId,
}) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  // Преобразуем строку в массив значений
  const values = React.useMemo(() => {
    const arr = value.split('');
    return Array.from({ length }, (_, i) => arr[i] || '');
  }, [value, length]);

  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, inputValue: string) => {
    // Разрешаем только цифры
    const digit = inputValue.replace(/\D/g, '').slice(0, 1);

    const newValues = [...values];
    newValues[index] = digit;
    const newCode = newValues.join('');
    
    onChange(newCode);

    // Автопереход к следующему полю
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Callback onComplete если все заполнено
    if (newValues.every((v) => v !== '') && newValues.length === length) {
      onComplete?.(newCode);
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
      onChange(digits);

      // Фокус на последнее заполненное поле
      const lastFilledIndex = Math.min(digits.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();

      if (digits.length === length) {
        onComplete?.(digits);
      }
    }
  };

  const fieldClasses = classNames('mobile-code-input__field', {
    'mobile-code-input__field_error': error,
  });

  return (
    <div className="mobile-code-input" data-testid={dataTestId}>
      {label && <label className="mobile-code-input__label">{label}</label>}

      <div className="mobile-code-input__fields">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled}
            className={fieldClasses}
            data-testid={`${dataTestId}-field-${index}`}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <span className="mobile-code-input__error">{error}</span>
      )}
    </div>
  );
};

export default MobileCodeInput;

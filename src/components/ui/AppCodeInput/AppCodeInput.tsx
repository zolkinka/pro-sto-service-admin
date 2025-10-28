import React from 'react';
import classNames from 'classnames';
import type { AppCodeInputProps } from './AppCodeInput.types';
import { useCodeInput } from './hooks/useCodeInput';
import './AppCodeInput.css';

/**
 * Компонент для ввода кода подтверждения из SMS
 * Состоит из нескольких полей для ввода цифр с автоматическим переключением фокуса
 * 
 * @example
 * ```tsx
 * <AppCodeInput
 *   label="Код из SMS"
 *   onComplete={(code) => console.log('Complete:', code)}
 * />
 * ```
 */
export const AppCodeInput: React.FC<AppCodeInputProps> = ({
  length = 4,
  onComplete,
  onChange,
  error,
  errorText,
  label,
  disabled = false,
  autoFocus = true,
  inputMode = 'numeric',
  'data-testid': dataTestId,
}) => {
  const {
    values,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
  } = useCodeInput({
    length,
    autoFocus,
    onComplete,
    onChange,
  });

  const hasError = Boolean(error);

  const labelClassName = classNames('app-code-input__label', {
    'app-code-input__label_error': hasError,
  });

  const fieldClassName = classNames('app-code-input__field', {
    'app-code-input__field_error': hasError,
  });

  return (
    <div className="app-code-input" data-testid={dataTestId}>
      {label && <label className={labelClassName}>{label}</label>}

      <div className="app-code-input__fields">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode={inputMode}
            maxLength={1}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled}
            className={fieldClassName}
            data-testid={`${dataTestId}-field-${index}`}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {hasError && errorText && (
        <span className="app-code-input__error-text">{errorText}</span>
      )}
    </div>
  );
};

AppCodeInput.displayName = 'AppCodeInput';

export default AppCodeInput;

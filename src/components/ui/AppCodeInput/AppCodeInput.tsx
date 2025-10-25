import React from 'react';
import type { AppCodeInputProps } from './AppCodeInput.types';
import { useCodeInput } from './hooks/useCodeInput';
import {
  CodeInputWrapper,
  CodeLabel,
  CodeFieldsContainer,
  CodeField,
  ErrorText,
} from './AppCodeInput.styles';

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

  return (
    <CodeInputWrapper data-testid={dataTestId}>
      {label && <CodeLabel $error={hasError}>{label}</CodeLabel>}

      <CodeFieldsContainer>
        {Array.from({ length }).map((_, index) => (
          <CodeField
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
            $error={hasError}
            data-testid={`${dataTestId}-field-${index}`}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </CodeFieldsContainer>

      {hasError && errorText && <ErrorText>{errorText}</ErrorText>}
    </CodeInputWrapper>
  );
};

AppCodeInput.displayName = 'AppCodeInput';

export default AppCodeInput;

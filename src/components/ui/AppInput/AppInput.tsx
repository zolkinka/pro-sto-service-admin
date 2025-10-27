import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import type { AppInputProps } from './AppInput.types';
import {
  InputWrapper,
  StyledLabel,
  RequiredIndicator,
  InputContainer,
  StyledInput,
  IconContainer,
  ErrorText,
} from './AppInput.styles';
import {
  generateInputId,
  isFieldFilled,
  formatErrorText,
  shouldShowError,
  combineClassNames,
} from './utils/inputHelpers';

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(({
  // Основные пропсы
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  
  // Label и описание
  label,
  required = false,
  
  // Ошибки
  error,
  errorText,
  
  // Визуальные настройки
  size = 'L',
  background = 'default',
  roundedBottom = true,
  
  // Иконки
  iconLeft,
  iconRight,
  
  // Обработчики
  onChange,
  onBlur,
  onFocus,
  
  // HTML атрибуты
  name,
  id,
  autoComplete,
  autoFocus = false,
  className,
  
  // Для расширения специализированными компонентами
  inputProps,
  
  'data-testid': dataTestId,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Forwarding ref to internal input ref
  useImperativeHandle(ref, () => inputRef.current!);
  
  // Определяем, является ли компонент controlled или uncontrolled
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;
  
  // Генерируем ID если не предоставлен
  const inputId = id || generateInputId('app-input');
  const errorId = `${inputId}-error`;
  
  // Определяем состояния
  const hasError = shouldShowError(error);
  const isFilled = isFieldFilled(inputValue);
  const errorMessage = error ? formatErrorText(error, errorText) : '';
  
  // Обработчики событий
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };
  
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue, event);
  };

  return (
    <InputWrapper 
      className={combineClassNames(className)}
      $disabled={disabled}
      data-testid={dataTestId}
    >
      {/* Label */}
      {label && (
        <StyledLabel 
          htmlFor={inputId}
          $required={required}
          $error={hasError}
        >
          {label}
          {required && (
            <RequiredIndicator $error={hasError}>
              *
            </RequiredIndicator>
          )}
        </StyledLabel>
      )}
      
      {/* Input Container */}
      <InputContainer
        $size={size}
        $background={background}
        $error={hasError}
        $isFocused={isFocused}
        $disabled={disabled}
        $roundedBottom={roundedBottom}
        data-disabled={disabled}
      >
        {/* Left Icon */}
        {iconLeft && (
          <IconContainer>
            {iconLeft}
          </IconContainer>
        )}
        
        {/* Input */}
        <StyledInput
          ref={inputRef}
          id={inputId}
          name={name}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          $size={size}
          $disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          data-filled={isFilled}
          {...inputProps}
        />
        
        {/* Right Icon */}
        {iconRight && (
          <IconContainer>
            {iconRight}
          </IconContainer>
        )}
      </InputContainer>
      
      {/* Error Text */}
      {hasError && errorMessage && (
        <ErrorText id={errorId}>
          {errorMessage}
        </ErrorText>
      )}
    </InputWrapper>
  );
});

AppInput.displayName = 'AppInput';

export default AppInput;
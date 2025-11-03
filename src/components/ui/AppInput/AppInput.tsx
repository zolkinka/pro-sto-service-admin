import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import { IMaskInput } from 'react-imask';
import type { AppInputProps } from './AppInput.types';
import {
  generateInputId,
  isFieldFilled,
  formatErrorText,
  shouldShowError,
  combineClassNames,
} from './utils/inputHelpers';
import './AppInput.css';

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
  
  // Суффикс
  suffix,
  
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
  
  // Пропсы для маски
  mask,
  unmask,
  placeholderChar = '_',
  lazy = false,
  onAccept,
  onComplete,
  
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

  const wrapperClasses = classNames(
    'app-input',
    {
      'app-input_disabled': disabled,
    },
    combineClassNames(className)
  );

  const containerClasses = classNames(
    'app-input__container',
    `app-input__container_size_${size}`,
    `app-input__container_background_${background}`,
    `app-input__container_rounded-bottom_${roundedBottom}`,
    {
      'app-input__container_error': hasError,
      'app-input__container_focused': isFocused,
      'app-input__container_disabled': disabled,
    }
  );

  const labelClasses = classNames(
    'app-input__label',
    {
      'app-input__label_error': hasError,
    }
  );

  const requiredClasses = classNames(
    'app-input__required',
    {
      'app-input__required_error': hasError,
    }
  );

  const fieldClasses = classNames(
    'app-input__field',
    `app-input__field_size_${size}`
  );

  return (
    <div 
      className={wrapperClasses}
      data-testid={dataTestId}
    >
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={labelClasses}
        >
          {label}
          {required && (
            <span className={requiredClasses}>
              *
            </span>
          )}
        </label>
      )}
      
      {/* Input Container */}
      <div className={containerClasses}>
        {/* Left Icon */}
        {iconLeft && (
          <span className="app-input__icon">
            {iconLeft}
          </span>
        )}
        
        {/* Input - с маской или без */}
        {mask ? (
          <IMaskInput
            mask={mask}
            unmask={unmask}
            lazy={lazy}
            placeholderChar={placeholderChar}
            // @ts-expect-error - IMaskInput expects string, but we ensure it's a string
            value={inputValue ? String(inputValue) : ''}
            onAccept={(value, maskRef) => {
              const newValue = unmask ? maskRef.unmaskedValue : value;
              if (!isControlled) {
                setInternalValue(newValue);
              }
              onChange?.(newValue, {} as React.ChangeEvent<HTMLInputElement>);
              onAccept?.(value, maskRef);
            }}
            onComplete={(value, maskRef) => {
              onComplete?.(value, maskRef);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            placeholder={placeholder}
            inputRef={inputRef}
            id={inputId}
            name={name}
            className={fieldClasses}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            data-filled={isFilled}
            {...inputProps}
          />
        ) : (
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={fieldClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            data-filled={isFilled}
            {...inputProps}
          />
        )}
        
        {/* Suffix */}
        {suffix && (
          <span className="app-input__suffix">
            {suffix}
          </span>
        )}
        
        {/* Right Icon */}
        {iconRight && (
          <span className="app-input__icon">
            {iconRight}
          </span>
        )}
      </div>
      
      {/* Error Text */}
      {hasError && errorMessage && (
        <span className="app-input__error" id={errorId}>
          {errorMessage}
        </span>
      )}
    </div>
  );
});

AppInput.displayName = 'AppInput';

export default AppInput;
import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
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

// Расширяем тип ref для поддержки метода updateMaskKey
export interface AppInputRef extends HTMLInputElement {
  updateMaskKey: () => void;
}

const AppInput = forwardRef<AppInputRef, AppInputProps>(({
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
  
  // Управление фокусом
  focused,
  
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
  // Состояние для key - обновляется только при программном изменении (blur)
  const [maskKey, setMaskKey] = useState(0);
  // Запоминаем последнее значение для сравнения
  const lastValueRef = useRef(value);
  // Флаг для отслеживания программных обновлений (из props)
  const isProgrammaticUpdateRef = useRef(false);
  // Ссылка на IMask instance для принудительного обновления значения
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maskInstanceRef = useRef<any>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Управление фокусом через проп focused
  useEffect(() => {
    // Если проп focused не передан, управление фокусом внутреннее
    if (focused === undefined) return;
    
    const input = inputRef.current;
    if (!input) return;
    
    if (focused && document.activeElement !== input) {
      input.focus();
    } else if (!focused && document.activeElement === input) {
      input.blur();
    }
  }, [focused]);
  
  // Forwarding ref to internal input ref + добавляем метод updateMaskKey
  useImperativeHandle(ref, () => ({
    ...inputRef.current!,
    updateMaskKey: () => {
      isProgrammaticUpdateRef.current = true;
      lastValueRef.current = value;
      
      // Если есть maskInstance, устанавливаем unmaskedValue
      if (maskInstanceRef.current && value !== undefined) {
        const valueStr = String(value);
        // Для unmask="typed" нужно установить именно те символы, которые пользователь ввел бы
        // Убираем все НЕ-цифровые символы, кроме +
        let unmaskedValue = valueStr.replace(/[^\d+]/g, '');
        
        // Если unmask="typed", убираем +7 в начале (это фиксированная часть маски)
        if (unmask === 'typed' && unmaskedValue.startsWith('+7')) {
          unmaskedValue = unmaskedValue.substring(2);
        } else if (unmaskedValue.startsWith('+')) {
          unmaskedValue = unmaskedValue.substring(1);
        }
        
        maskInstanceRef.current.unmaskedValue = unmaskedValue;
      } else {
        // Иначе перерисовываем компонент через изменение key
        setMaskKey(prev => prev + 1);
      }
    },
  }));
  
  // Отслеживаем изменения value из props для маски
  useEffect(() => {
    if (mask && value !== undefined && value !== lastValueRef.current) {
      isProgrammaticUpdateRef.current = true;
      lastValueRef.current = value;
      // Обновляем maskKey чтобы пересоздать IMaskInput с новым value
      setMaskKey(prev => prev + 1);
    }
  }, [value, mask]);
  
  // Определяем, является ли компонент controlled или uncontrolled
  const isControlled = value !== undefined;
  const inputValue = isControlled ? (value as string) : internalValue;
  
  // Prepare masked input value
  const maskedInputValue = useMemo<string | undefined>(() => {
    if (!inputValue) return undefined;
    // Explicit type assertion since we know inputValue is a string from our props
    return String(inputValue) as string;
  }, [inputValue]);
  
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
    
    // Если значение изменилось извне (программно), обновляем maskKey
    if (mask && value !== undefined && value !== lastValueRef.current) {
      lastValueRef.current = value;
      setMaskKey(prev => prev + 1);
    }
    
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
            key={`mask-${maskKey}`}
            mask={mask}
            unmask={unmask}
            lazy={lazy}
            placeholderChar={placeholderChar}
            // @ts-expect-error - type mismatch between inputValue and IMaskInput value prop
            value={maskedInputValue}
            onAccept={(value, maskRefInstance) => {
              // Сохраняем ссылку на maskInstance для использования в updateMaskKey
              maskInstanceRef.current = maskRefInstance;
              
              // Если это программное обновление (из props), не вызываем onChange
              if (isProgrammaticUpdateRef.current) {
                // НЕ сбрасываем флаг сразу - отложим на следующий тик
                // чтобы перехватить ВСЕ события от IMask
                setTimeout(() => {
                  isProgrammaticUpdateRef.current = false;
                }, 0);
                onAccept?.(value, maskRefInstance);
                return;
              }
              
              const newValue = unmask ? maskRefInstance.unmaskedValue : value;
              if (!isControlled) {
                setInternalValue(newValue);
              }
              onChange?.(newValue, {} as React.ChangeEvent<HTMLInputElement>);
              onAccept?.(value, maskRefInstance);
            }}
            onComplete={(value, maskRefInstance) => {
              onComplete?.(value, maskRefInstance);
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
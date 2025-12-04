import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import type { AppTextareaProps } from './AppTextarea.types';
import './AppTextarea.css';

// Генерация уникального ID
let idCounter = 0;
const generateTextareaId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(({
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
  
  // Размеры textarea
  minRows = 3,
  maxRows,
  resize = 'vertical',
  autoResize = false,
  
  // Обработчики
  onChange,
  onBlur,
  onFocus,
  
  // HTML атрибуты
  name,
  id,
  autoFocus = false,
  className,
  maxLength,
  
  'data-testid': dataTestId,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Forwarding ref to internal textarea ref
  useImperativeHandle(ref, () => textareaRef.current!);
  
  // Определяем, является ли компонент controlled или uncontrolled
  const isControlled = value !== undefined;
  const textareaValue = isControlled ? (value as string) : internalValue;
  
  // Генерируем ID если не предоставлен
  const textareaId = id || generateTextareaId('app-textarea');
  const errorId = `${textareaId}-error`;
  
  // Определяем состояния
  const hasError = !!error;
  const errorMessage = typeof error === 'string' ? error : errorText;
  
  // Вычисляем минимальную и максимальную высоту на основе количества строк
  const lineHeight = size === 'L' ? 21 : 19.6; // 15px * 1.4 или 14px * 1.4
  const minHeight = minRows * lineHeight;
  const maxHeight = maxRows ? maxRows * lineHeight : undefined;

  // Функция для авторесайза
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    // Сбрасываем высоту, чтобы получить правильный scrollHeight
    textarea.style.height = 'auto';
    
    // Вычисляем новую высоту
    let newHeight = textarea.scrollHeight;
    
    // Применяем ограничения
    if (newHeight < minHeight) {
      newHeight = minHeight;
    }
    if (maxHeight && newHeight > maxHeight) {
      newHeight = maxHeight;
    }
    
    textarea.style.height = `${newHeight}px`;
  }, [autoResize, minHeight, maxHeight]);

  // Вызываем авторесайз при изменении значения
  useEffect(() => {
    if (autoResize) {
      adjustHeight();
    }
  }, [textareaValue, autoResize, adjustHeight]);
  
  // Обработчики событий
  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };
  
  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };
  
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    // Авторесайз при изменении
    if (autoResize) {
      requestAnimationFrame(adjustHeight);
    }
    
    onChange?.(newValue, event);
  };

  const wrapperClasses = classNames(
    'app-textarea',
    {
      'app-textarea_disabled': disabled,
    },
    className
  );

  const containerClasses = classNames(
    'app-textarea__container',
    `app-textarea__container_size_${size}`,
    `app-textarea__container_background_${background}`,
    {
      'app-textarea__container_error': hasError,
      'app-textarea__container_focused': isFocused,
      'app-textarea__container_disabled': disabled,
    }
  );

  const labelClasses = classNames(
    'app-textarea__label',
    {
      'app-textarea__label_error': hasError,
    }
  );

  const requiredClasses = classNames(
    'app-textarea__required',
    {
      'app-textarea__required_error': hasError,
    }
  );

  const fieldClasses = classNames(
    'app-textarea__field',
    `app-textarea__field_size_${size}`,
    `app-textarea__field_resize_${autoResize ? 'none' : resize}`
  );

  return (
    <div 
      className={wrapperClasses}
      data-testid={dataTestId}
    >
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId}
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
      
      {/* Textarea Container */}
      <div className={containerClasses}>
        <textarea
          ref={textareaRef}
          id={textareaId}
          name={name}
          value={textareaValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className={fieldClasses}
          style={{ 
            minHeight,
            ...(maxHeight && !autoResize ? { maxHeight } : {}),
            ...(autoResize ? { overflow: 'hidden' } : {})
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        />
      </div>
      
      {/* Error Text */}
      {hasError && errorMessage && (
        <span className="app-textarea__error" id={errorId}>
          {errorMessage}
        </span>
      )}
      
      {/* Character counter */}
      {maxLength && (
        <span className="app-textarea__counter">
          {textareaValue.length}/{maxLength}
        </span>
      )}
    </div>
  );
});

AppTextarea.displayName = 'AppTextarea';

export default AppTextarea;

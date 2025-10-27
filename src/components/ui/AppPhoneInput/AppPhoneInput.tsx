import React, { useState, useRef, forwardRef } from 'react';
import AppInput from '../AppInput/AppInput';
import type { AppPhoneInputProps } from './AppPhoneInput.types';
import { extractPhoneDigits, validatePhone } from './utils/phoneHelpers';
import { useInputMask } from '../AppInput/hooks/useInputMask';

/**
 * Специализированный компонент для ввода номера телефона с автоматическим форматированием
 * Использует базовый AppInput с интеграцией IMask для маски телефона
 * 
 * @example
 * ```tsx
 * <AppPhoneInput
 *   label="Номер телефона"
 *   onPhoneComplete={(phone) => console.log('Complete:', phone)}
 *   onValidate={(isValid, phone) => console.log('Valid:', isValid)}
 * />
 * ```
 */
const AppPhoneInput = forwardRef<HTMLInputElement, AppPhoneInputProps>(({
  value,
  defaultValue,
  onChange,
  onBlur,
  onPhoneComplete,
  onValidate,
  validateOnBlur = true,
  error,
  label = 'Номер телефона',
  placeholder = '+7 (___) ___-__-__',
  ...restProps
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalError, setInternalError] = useState<string>('');
  
  // Используем ref переданный извне или создаем свой
  const actualInputRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;
  
  // Настройка маски через useInputMask
  useInputMask(actualInputRef, {
    mask: '+{7} (000) 000-00-00',
    value: value || defaultValue,
    onComplete: (value) => {
      const cleanPhone = extractPhoneDigits(value);
      onPhoneComplete?.(cleanPhone);
      onValidate?.(true, cleanPhone);
      setInternalError('');
    },
    onAccept: (value) => {
      const cleanPhone = extractPhoneDigits(value);
      
      // Вызываем onChange с чистым номером (без +7)
      onChange?.(cleanPhone, {} as React.ChangeEvent<HTMLInputElement>);
    },
  });
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (validateOnBlur) {
      const cleanPhone = extractPhoneDigits(e.target.value);
      const isValid = validatePhone(cleanPhone);
      
      if (!isValid && cleanPhone.length > 0) {
        setInternalError('Введите корректный номер телефона');
        onValidate?.(false, cleanPhone);
      } else if (cleanPhone.length > 0) {
        setInternalError('');
        onValidate?.(true, cleanPhone);
      } else {
        // Пустое поле - не показываем ошибку
        setInternalError('');
      }
    }
    
    onBlur?.(e);
  };
  
  return (
    <AppInput
      ref={actualInputRef}
      value={value}
      defaultValue={defaultValue}
      label={label}
      placeholder={placeholder}
      size="L"
      error={error || internalError}
      onBlur={handleBlur}
      inputProps={{
        type: 'tel',
        inputMode: 'tel',
        autoComplete: 'tel',
      }}
      {...restProps}
    />
  );
});

AppPhoneInput.displayName = 'AppPhoneInput';

export default AppPhoneInput;

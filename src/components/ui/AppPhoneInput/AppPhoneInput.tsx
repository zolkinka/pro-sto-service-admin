import React, { useState, forwardRef } from 'react';
import { AppInput } from '../AppInput';
import type { AppPhoneInputProps } from './AppPhoneInput.types';
import { extractPhoneDigits, validatePhone } from './utils/phoneHelpers';

/**
 * Специализированный компонент для ввода номера телефона с автоматическим форматированием
 * Использует AppInput с маской для удобного ввода
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
  onChange,
  onBlur,
  onPhoneComplete,
  onValidate,
  validateOnBlur = true,
  error,
  label = 'Номер телефона',
  placeholder = '+7 (___) ___-__-__',
  disabled,
  autoFocus,
  // countryCode - зарезервировано для будущего использования
  ...restProps
}, ref) => {
  const [internalError, setInternalError] = useState<string>('');
  
  const handleAccept = (maskedValue: string) => {
    const cleanPhone = extractPhoneDigits(maskedValue);
    onChange?.(cleanPhone, {} as React.ChangeEvent<HTMLInputElement>);
  };
  
  const handleComplete = (maskedValue: string) => {
    const cleanPhone = extractPhoneDigits(maskedValue);
    onPhoneComplete?.(cleanPhone);
    onValidate?.(true, cleanPhone);
    setInternalError('');
  };
  
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
      ref={ref}
      value={value}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      error={error || internalError}
      onBlur={handleBlur}
      // Маска для телефона
      mask="+{7} (000) 000-00-00"
      lazy={false}
      placeholderChar="_"
      onAccept={handleAccept}
      onComplete={handleComplete}
      {...restProps}
    />
  );
});

AppPhoneInput.displayName = 'AppPhoneInput';

export default AppPhoneInput;
import React, { useState, forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import type { AppPhoneInputProps } from './AppPhoneInput.types';
import { extractPhoneDigits, validatePhone } from './utils/phoneHelpers';
import './AppPhoneInput.css';

/**
 * Специализированный компонент для ввода номера телефона с автоматическим форматированием
 * Использует react-imask для маски телефона
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
  defaultValue,
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
  ...restProps
}, ref) => {
  const [internalError, setInternalError] = useState<string>('');
  const [maskValue, setMaskValue] = useState('');
  
  const handleAccept = (value: string) => {
    setMaskValue(value);
    const cleanPhone = extractPhoneDigits(value);
    onChange?.(cleanPhone, {} as React.ChangeEvent<HTMLInputElement>);
  };
  
  const handleComplete = (value: string) => {
    const cleanPhone = extractPhoneDigits(value);
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
    <div className="app-phone-input">
      {label && <label className="app-phone-input__label">{label}</label>}
      <IMaskInput
        mask="+{7} (000) 000-00-00"
        lazy={false}
        placeholderChar="_"
        value={maskValue}
        onAccept={handleAccept}
        onComplete={handleComplete}
        onBlur={handleBlur}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        inputRef={ref}
        className={`app-phone-input__input ${error || internalError ? 'app-phone-input__input--error' : ''}`}
        {...restProps}
      />
      {(error || internalError) && (
        <div className="app-phone-input__error">{error || internalError}</div>
      )}
    </div>
  );
});

AppPhoneInput.displayName = 'AppPhoneInput';

export default AppPhoneInput;

import React, { forwardRef, useState } from 'react';
import { IMaskInput } from 'react-imask';
import classNames from 'classnames';
import './MobileInput.css';

export interface MobileInputRef extends HTMLInputElement {
  updateMaskKey?: () => void;
}

export interface MobileInputProps {
  value?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  type?: 'text' | 'tel' | 'number';
  inputMode?: 'text' | 'tel' | 'numeric';
  
  // Маска
  mask?: string;
  unmask?: boolean | 'typed';
  placeholderChar?: string;
  lazy?: boolean;
  
  // Обработчики
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onAccept?: (value: string, maskRef?: unknown) => void;
  onComplete?: (value: string, maskRef?: unknown) => void;
  onValidate?: (valid: boolean, value: string) => void;
  
  'data-testid'?: string;
}

const MobileInput = forwardRef<MobileInputRef, MobileInputProps>(({
  value,
  label,
  placeholder,
  error,
  disabled = false,
  autoFocus = false,
  type = 'text',
  inputMode,
  
  // Маска
  mask,
  unmask,
  placeholderChar = '_',
  lazy = false,
  
  // Обработчики
  onChange,
  onBlur,
  onFocus,
  onAccept,
  onComplete,
  
  'data-testid': dataTestId,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Forwarding ref
  React.useImperativeHandle(ref, () => ({
    ...inputRef.current!,
  }));
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };
  
  const wrapperClasses = classNames('mobile-input', {
    'mobile-input_error': error,
    'mobile-input_focused': isFocused,
    'mobile-input_disabled': disabled,
  });
  
  const fieldClasses = classNames('mobile-input__field');
  
  return (
    <div className={wrapperClasses} data-testid={dataTestId}>
      {label && (
        <label className="mobile-input__label">
          {label}
        </label>
      )}
      
      <div className="mobile-input__container">
        {mask ? (
          <IMaskInput
            mask={mask}
            unmask={unmask}
            lazy={lazy}
            placeholderChar={placeholderChar}
            value={value}
            onAccept={(value, maskRefInstance) => {
              const newValue = unmask ? maskRefInstance.unmaskedValue : value;
              onChange?.(newValue);
              onAccept?.(value, maskRefInstance);
            }}
            onComplete={(value, maskRefInstance) => {
              onComplete?.(value, maskRefInstance);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            inputRef={inputRef}
            className={fieldClasses}
            inputMode={inputMode || 'tel'}
            autoFocus={autoFocus}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            inputMode={inputMode}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={fieldClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        )}
      </div>
      
      {error && (
        <span className="mobile-input__error">
          {error}
        </span>
      )}
    </div>
  );
});

MobileInput.displayName = 'MobileInput';

export default MobileInput;

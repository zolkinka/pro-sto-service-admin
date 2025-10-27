import React, { useState, useCallback, useMemo, type ReactNode } from 'react';
import { AppBaseDropdown, type AppBaseDropdownProps } from '../AppBaseDropdown';
import { AppBaseInput, type AppBaseInputProps } from '../AppBaseInput';
import './AppSingleSelect.css';

export interface OptionType {
  label: string;
  value: string;
}

export interface AppSingleSelectProps {
  value?: OptionType;
  label?: string;
  disabled?: boolean;
  error?: string;
  focused?: boolean;
  required?: boolean;
  placeholder?: string;
  clearable?: boolean;
  options: OptionType[];
  onChange?(value: OptionType | undefined): void;
  toggle?: ReactNode;
  dropdown?: ReactNode;
  option?: ReactNode;
  toggleProps?: Partial<AppBaseInputProps>;
  baseDropdownProps?: Partial<AppBaseDropdownProps>;
}

export const AppSingleSelect: React.FC<AppSingleSelectProps> = ({
  value,
  label,
  disabled = false,
  error,
  focused = false,
  required = false,
  placeholder,
  clearable = false,
  options = [],
  onChange,
  toggle,
  dropdown,
  option,
  toggleProps = {},
  baseDropdownProps = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalFocused, setInternalFocused] = useState(focused);

  // Фильтрация опций по поисковому запросу
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Определяем значение для input
  const inputValue = useMemo(() => {
    if (internalFocused) {
      return searchQuery;
    }
    return value?.label || '';
  }, [internalFocused, searchQuery, value]);

  // Определяем, заполнено ли поле
  const isFilled = useMemo(() => {
    return !!value || searchQuery.length > 0;
  }, [value, searchQuery]);

  const handleToggleClick = useCallback(() => {
    if (disabled) return;
    if (!isOpen) {
      setIsOpen(true);
      setInternalFocused(true);
    }
  }, [disabled, isOpen]);

  const handleInputClick = useCallback(() => {
    if (disabled) return;
    if (!isOpen) {
      setIsOpen(true);
      setInternalFocused(true);
    } else {
      // Если dropdown уже открыт, переводим в режим поиска
      setInternalFocused(true);
    }
  }, [disabled, isOpen]);

  const handleInputFocus = useCallback(() => {
    setInternalFocused(true);
    toggleProps?.onFocus?.();
  }, [toggleProps]);

  const handleInputBlur = useCallback(() => {
    // Проверяем, не кликнули ли мы на опцию внутри dropdown
    setTimeout(() => {
      setInternalFocused(false);
      setIsOpen(false);
      setSearchQuery('');
      toggleProps?.onBlur?.();
    }, 150);
  }, [toggleProps]);

  const handleInputChange = useCallback((newValue: string | number) => {
    if (internalFocused) {
      setSearchQuery(String(newValue));
    }
    toggleProps?.onChange?.(newValue);
  }, [internalFocused, toggleProps]);

  const handleOptionSelect = useCallback((selectedOption: OptionType) => {
    onChange?.(selectedOption);
    setIsOpen(false);
    setInternalFocused(false);
    setSearchQuery('');
  }, [onChange]);

  const handleClear = useCallback(() => {
    if (clearable && !disabled) {
      onChange?.(undefined);
      setSearchQuery('');
    }
  }, [clearable, disabled, onChange]);

  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
    setInternalFocused(false);
    setSearchQuery('');
  }, []);

  // Рендер toggle
  const renderToggle = () => {
    if (toggle) return toggle;

    return (
      <div className="app-single-select__toggle">
        <div onClick={handleInputClick}>
          <AppBaseInput
            {...toggleProps}
            value={inputValue}
            label={label}
            disabled={disabled}
            error={error}
            required={required}
            placeholder={placeholder}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            // Передаем состояние заполненности и фокуса в AppBaseInput
            filled={isFilled}
            focused={internalFocused}
          />
        </div>
        {clearable && value && !disabled && (
          <button
            className="app-single-select__clear-button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            type="button"
          >
            ×
          </button>
        )}
        <div 
          className={`app-single-select__arrow ${isOpen ? 'app-single-select__arrow--open' : ''}`}
          onClick={handleToggleClick}
        >
          ▼
        </div>
      </div>
    );
  };

  // Рендер dropdown
  const renderDropdown = () => {
    if (dropdown) return dropdown;

    return (
      <div className="app-single-select__dropdown">
        {filteredOptions.length === 0 ? (
          <div className="app-single-select__no-options">
            Нет доступных опций
          </div>
        ) : (
          filteredOptions.map((optionItem) => (
            <div
              key={optionItem.value}
              className={`app-single-select__option ${
                value?.value === optionItem.value ? 'app-single-select__option--selected' : ''
              }`}
              onClick={() => handleOptionSelect(optionItem)}
            >
              {option || optionItem.label}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className={`app-single-select ${disabled ? 'app-single-select--disabled' : ''}`}>
      <AppBaseDropdown
        {...baseDropdownProps}
        opened={isOpen}
        onClose={handleDropdownClose}
        toggle={renderToggle()}
        dropdown={renderDropdown()}
      />
    </div>
  );
};
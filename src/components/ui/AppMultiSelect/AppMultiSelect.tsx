import React, { useState, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { AppBaseDropdown, type AppBaseDropdownProps } from '../AppBaseDropdown';
import './AppMultiSelect.css';

export interface OptionType {
  label: string;
  value: string;
}

export interface AppMultiSelectProps {
  value?: OptionType[];
  label?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  placeholder?: string;
  clearable?: boolean;
  options: OptionType[];
  onChange?(value: OptionType[]): void;
  toggle?: ReactNode;
  dropdown?: ReactNode;
  option?: ReactNode;
  baseDropdownProps?: Partial<AppBaseDropdownProps>;
}

export const AppMultiSelect: React.FC<AppMultiSelectProps> = ({
  value = [],
  label,
  disabled = false,
  error,
  required = false,
  placeholder = 'Поиск...',
  clearable = false,
  options = [],
  onChange,
  toggle,
  dropdown,
  option,
  baseDropdownProps = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Фильтрация опций по поисковому запросу
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Проверяем, выбрана ли опция
  const isOptionSelected = useCallback((optionValue: string) => {
    return value.some(selectedOption => selectedOption.value === optionValue);
  }, [value]);

  const handleToggleClick = useCallback(() => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Фокусируем input при открытии
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [disabled, isOpen]);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Простая задержка для обработки клика по опции
    // onMouseDown с preventDefault должен предотвратить blur
    setTimeout(() => {
      if (!inputRef.current || inputRef.current !== document.activeElement) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }, 100);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleOptionSelect = useCallback((selectedOption: OptionType) => {
    if (isOptionSelected(selectedOption.value)) {
      // Убираем опцию из выбранных
      const newValue = value.filter(item => item.value !== selectedOption.value);
      onChange?.(newValue);
    } else {
      // Добавляем опцию к выбранным
      const newValue = [...value, selectedOption];
      onChange?.(newValue);
    }
    // Очищаем поисковый запрос и фокусируем input обратно для продолжения выбора
    setSearchQuery('');
    // Возвращаем фокус на input, чтобы dropdown оставался открытым
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [value, onChange, isOptionSelected]);

  const handleChipRemove = useCallback((optionToRemove: OptionType) => {
    const newValue = value.filter(item => item.value !== optionToRemove.value);
    onChange?.(newValue);
  }, [value, onChange]);

  const handleClearAll = useCallback(() => {
    if (clearable && !disabled) {
      onChange?.([]);
      setSearchQuery('');
    }
  }, [clearable, disabled, onChange]);

  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  // Рендер toggle
  const renderToggle = () => {
    if (toggle) return toggle;

    return (
      <div className="app-multi-select__field-container">
        {label && (
          <label className="app-multi-select__label">
            {label}
            {required && <span className="app-multi-select__required">*</span>}
          </label>
        )}
        <div className="app-multi-select__input-container" onClick={handleToggleClick}>
          {/* Выбранные элементы в виде chips */}
          <div className="app-multi-select__chips">
            {value.map((selectedOption) => (
              <div
                key={selectedOption.value}
                className="app-multi-select__chip"
              >
                {selectedOption.label}
                <span 
                  className="app-multi-select__chip-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChipRemove(selectedOption);
                  }}
                >
                  ×
                </span>
              </div>
            ))}
          </div>

          {/* Input для поиска */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="app-multi-select__input"
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Кнопка очистки всех значений */}
          {clearable && value.length > 0 && !disabled && (
            <button
              className="app-multi-select__clear-button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              type="button"
            >
              ×
            </button>
          )}

          {/* Стрелка */}
          <div 
            className={`app-multi-select__arrow ${isOpen ? 'app-multi-select__arrow--open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleClick();
            }}
          >
            ▼
          </div>
        </div>
        {error && <div className="app-multi-select__error">{error}</div>}
      </div>
    );
  };

  // Рендер dropdown
  const renderDropdown = () => {
    if (dropdown) return dropdown;

    return (
      <div 
        className="app-multi-select__dropdown"
        onMouseDown={(e) => {
          // Предотвращаем потерю фокуса при клике по dropdown
          e.preventDefault();
        }}
      >
        {filteredOptions.length === 0 ? (
          <div className="app-multi-select__no-options">
            Нет доступных опций
          </div>
        ) : (
          filteredOptions.map((optionItem) => (
            <div
              key={optionItem.value}
              className={`app-multi-select__option ${
                isOptionSelected(optionItem.value) ? 'app-multi-select__option--selected' : ''
              }`}
              onMouseDown={(e) => {
                // Предотвращаем потерю фокуса при клике по опции
                e.preventDefault();
                handleOptionSelect(optionItem);
              }}
            >
              <div className="app-multi-select__option-content">
                {option || optionItem.label}
              </div>
              {isOptionSelected(optionItem.value) && (
                <div className="app-multi-select__option-check">✓</div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className={`app-multi-select ${disabled ? 'app-multi-select--disabled' : ''}`}>
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
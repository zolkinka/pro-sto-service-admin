import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { AppInput } from '../AppInput';
import type { AppSingleSelectProps, SelectOption } from './AppSingleSelect.types';
import { ChevronDownIcon } from './ChevronDownIcon';
import './AppSingleSelect.css';

/**
 * AppSingleSelect - Компонент для выбора одного значения из списка
 * 
 * @example
 * ```tsx
 * const options = [
 *   { label: 'Москва', value: 'moscow' },
 *   { label: 'Санкт-Петербург', value: 'spb' },
 * ];
 * 
 * <AppSingleSelect
 *   label="Выберите город"
 *   options={options}
 *   value={selectedCity}
 *   onChange={setSelectedCity}
 *   clearable
 * />
 * ```
 */
export const AppSingleSelect: React.FC<AppSingleSelectProps> = ({
  value,
  label,
  disabled = false,
  error,
  required = false,
  placeholder = 'Выберите...',
  searchPlaceholder = 'Поиск...',
  clearable = false,
  options = [],
  onChange,
  toggle,
  dropdown,
  option,
  baseDropdownProps = {},
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация опций по поисковому запросу
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Обработчик выбора опции
  const handleSelect = useCallback((selectedOption: SelectOption) => {
    onChange?.(selectedOption);
    setIsOpen(false);
    setSearchQuery('');
  }, [onChange]);

  // Обработчик очистки значения
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  }, [onChange]);

  // Обработчик клика по input
  const handleInputClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  // Обработчик закрытия dropdown
  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  // Рендер toggle (кастомный или дефолтный)
  const renderToggle = () => {
    if (toggle) return toggle;

    const arrowClassName = classNames('app-single-select__arrow', {
      'app-single-select__arrow_open': isOpen,
    });

    return (
      <div className="app-single-select__input-container">
        <div className="app-single-select__input-wrapper" onClick={handleInputClick}>
          <AppInput
            value={value?.label || ''}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            required={required}
            readOnly
            roundedBottom={!isOpen}
          />
          {clearable && value && !disabled && (
            <button
              className="app-single-select__clear-button"
              onClick={handleClear}
              type="button"
              aria-label="Очистить"
            >
              ×
            </button>
          )}
          <div className={arrowClassName} aria-hidden="true">
            <ChevronDownIcon color="#B2B1AE" size={20} />
          </div>
        </div>
      </div>
    );
  };

  // Рендер dropdown (кастомный или дефолтный)
  const renderDropdown = () => {
    if (dropdown) return dropdown;

    return (
      <div className="app-single-select__dropdown" role="listbox">
        {/* Поиск показывается только для списков > 10 элементов */}
        {options.length > 10 && (
          <input
            type="text"
            className="app-single-select__search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            aria-label="Поиск по опциям"
          />
        )}
        <div className="app-single-select__options-container">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((optionItem) => {
              const optionClassName = classNames('app-single-select__option', {
                'app-single-select__option_selected': value?.value === optionItem.value,
              });

              return (
                <div
                  key={optionItem.value}
                  className={optionClassName}
                  onClick={() => handleSelect(optionItem)}
                  role="option"
                  aria-selected={value?.value === optionItem.value}
                >
                  {option || optionItem.label}
                  {value?.value === optionItem.value && (
                    <div className="app-single-select__option-check" aria-hidden="true">
                      ✓
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="app-single-select__no-options" role="status">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    );
  };

  const wrapperClassName = classNames('app-single-select', {
    'app-single-select_disabled': disabled,
  }, className);

  return (
    <div className={wrapperClassName}>
      <AppBaseDropdown
        {...baseDropdownProps}
        opened={isOpen}
        onClose={handleDropdownClose}
        toggle={renderToggle()}
        dropdown={renderDropdown()}
        maxDropdownHeight={280}
        noRestrictHeigth={true}
      />
    </div>
  );
};

AppSingleSelect.displayName = 'AppSingleSelect';
import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { AppInput } from '../AppInput';
import { AppTag } from '../AppTag';
import type { AppMultiSelectProps, SelectOption } from './AppMultiSelect.types';
import { ChevronDownIcon } from '../AppSingleSelect/ChevronDownIcon';
import './AppMultiSelect.css';

/**
 * AppMultiSelect - Компонент для выбора нескольких значений из списка
 * 
 * @example
 * ```tsx
 * const options = [
 *   { label: 'Москва', value: 'moscow' },
 *   { label: 'Санкт-Петербург', value: 'spb' },
 * ];
 * 
 * <AppMultiSelect
 *   label="Выберите города"
 *   options={options}
 *   value={selectedCities}
 *   onChange={setSelectedCities}
 *   clearable
 * />
 * ```
 */

export const AppMultiSelect: React.FC<AppMultiSelectProps> = ({
  value = [],
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

  // Проверяем, выбрана ли опция
  const isOptionSelected = useCallback((optionValue: string | number) => {
    return value.some(selectedOption => selectedOption.value === optionValue);
  }, [value]);

  // Обработчик выбора опции
  const handleSelect = useCallback((selectedOption: SelectOption) => {
    if (isOptionSelected(selectedOption.value)) {
      // Убираем опцию из выбранных
      const newValue = value.filter(item => item.value !== selectedOption.value);
      onChange?.(newValue);
    } else {
      // Добавляем опцию к выбранным
      const newValue = [...value, selectedOption];
      onChange?.(newValue);
    }
    // Очищаем поисковый запрос после выбора
    setSearchQuery('');
  }, [value, onChange, isOptionSelected]);

  // Обработчик удаления тега
  const handleTagRemove = useCallback((optionToRemove: SelectOption) => {
    const newValue = value.filter(item => item.value !== optionToRemove.value);
    onChange?.(newValue);
  }, [value, onChange]);

  // Обработчик очистки всех значений
  const handleClearAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.([]);
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

    const arrowClassName = classNames('app-multi-select__arrow', {
      'app-multi-select__arrow_open': isOpen,
    });

    return (
      <div className="app-multi-select__input-container">
        <div className="app-multi-select__input-wrapper" onClick={handleInputClick}>
          <AppInput
            value=""
            label={label}
            placeholder={value.length > 0 ? '' : placeholder}
            disabled={disabled}
            error={error}
            required={required}
            readOnly
            roundedBottom={!isOpen}
          />
          
          {/* Теги поверх input */}
          {value.length > 0 && (
            <div className="app-multi-select__tags-container">
              {value.map((selectedOption) => (
                <div key={selectedOption.value} className="app-multi-select__tag-wrapper">
                  <AppTag
                    size="L"
                    color="gray"
                    closable
                    onClose={() => handleTagRemove(selectedOption)}
                  >
                    {selectedOption.label}
                  </AppTag>
                </div>
              ))}
            </div>
          )}
          
          {clearable && value.length > 0 && !disabled && (
            <button
              className="app-multi-select__clear-button"
              onClick={handleClearAll}
              type="button"
              aria-label="Очистить все"
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
      <div className="app-multi-select__dropdown" role="listbox">
        {/* Поиск показывается только для списков > 10 элементов */}
        {options.length > 10 && (
          <input
            type="text"
            className="app-multi-select__search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            aria-label="Поиск по опциям"
          />
        )}
        <div className="app-multi-select__options-container">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((optionItem) => {
              const optionClassName = classNames('app-multi-select__option', {
                'app-multi-select__option_selected': isOptionSelected(optionItem.value),
              });

              return (
                <div
                  key={optionItem.value}
                  className={optionClassName}
                  onClick={() => handleSelect(optionItem)}
                  role="option"
                  aria-selected={isOptionSelected(optionItem.value)}
                >
                  {option || optionItem.label}
                  {isOptionSelected(optionItem.value) && (
                    <div className="app-multi-select__option-check" aria-hidden="true">
                      ✓
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="app-multi-select__no-options" role="status">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    );
  };

  const wrapperClassName = classNames('app-multi-select', {
    'app-multi-select_disabled': disabled,
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

AppMultiSelect.displayName = 'AppMultiSelect';
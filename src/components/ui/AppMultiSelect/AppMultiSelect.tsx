import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { AppInput } from '../AppInput';
import { AppTag } from '../AppTag';
import type { AppMultiSelectProps, SelectOption } from './AppMultiSelect.types';
import { ChevronDownIcon } from '../AppSingleSelect/ChevronDownIcon';
import { usePlatform } from '../../../hooks';
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
  multiline = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const platform = usePlatform();
  const isMobileMode = platform === 'mobile';

  // В mobile режиме: фиксированная высота если есть поиск (>10 опций), иначе динамическая
  const hasSearch = options.length > 10;

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

  // Рендер label отдельно от toggle (для корректного позиционирования дропдауна)
  const renderLabel = () => {
    if (!label) return null;
    // В multiline режиме с выбранными значениями label рендерится в toggle
    if (multiline && value.length > 0) return null;
    
    return (
      <span className="app-multi-select__label">{label}{required && <span className="app-multi-select__required">*</span>}</span>
    );
  };

  // Рендер toggle (кастомный или дефолтный)
  const renderToggle = () => {
    if (toggle) return toggle;

    const arrowClassName = classNames('app-multi-select__arrow', {
      'app-multi-select__arrow_open': isOpen,
    });

    return (
      <div className="app-multi-select__input-container">
        {/* Label для multiline режима - вынесен наружу */}
        {multiline && value.length > 0 && label && (
          <span className="app-multi-select__label">{label}</span>
        )}
        <div className={classNames('app-multi-select__input-wrapper', {
          'app-multi-select__input-wrapper_multiline': multiline && value.length > 0,
        })} onClick={handleInputClick}>
          {/* В multiline режиме скрываем input когда есть теги */}
          {!(multiline && value.length > 0) && (
            <AppInput
              value=""
              placeholder={value.length === 0 ? placeholder : ' '}
              disabled={disabled}
              error={error}
              readOnly
              inputProps={{ style: { cursor: 'pointer' } }}
            />
          )}
          
          {/* Теги поверх input */}
          {value.length > 0 && (
            <div className={classNames('app-multi-select__tags-container', {
              'app-multi-select__tags-container_multiline': multiline,
            })}>
              {multiline ? (
                // Многострочный режим - все теги
                value.map((selectedOption) => (
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
                ))
              ) : (
                // Обычный режим - первый тег + счётчик
                <>
                  <div className="app-multi-select__tag-wrapper">
                    <AppTag
                      size="L"
                      color="gray"
                      closable
                      onClose={() => handleTagRemove(value[0])}
                    >
                      {value[0].label}
                    </AppTag>
                  </div>
                  {value.length > 1 && (
                    <div className="app-multi-select__tag-wrapper">
                      <AppTag size="L" color="gray">
                        +{value.length - 1}
                      </AppTag>
                    </div>
                  )}
                </>
              )}
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

  // Рендер mobile drawer содержимого
  const renderMobileDrawer = () => {
    return (
      <div className="app-multi-select__mobile-drawer">
        {/* Поиск показывается только для списков > 10 элементов */}
        {hasSearch && (
          <div className="app-multi-select__mobile-search">
            <AppInput
              value={searchQuery}
              placeholder={searchPlaceholder}
              onChange={setSearchQuery}
              autoComplete="off"
              autoFocus
            />
          </div>
        )}
        
        <div className="app-multi-select__mobile-options">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((optionItem) => {
              const optionClassName = classNames('app-multi-select__mobile-option', {
                'app-multi-select__mobile-option_selected': isOptionSelected(optionItem.value),
              });

              return (
                <div
                  key={optionItem.value}
                  className={optionClassName}
                  onClick={() => handleSelect(optionItem)}
                >
                  {option || optionItem.label}
                  {isOptionSelected(optionItem.value) && (
                    <div className="app-multi-select__mobile-option-check" aria-hidden="true">
                      ✓
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="app-multi-select__mobile-no-options">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    );
  };

  const wrapperClassName = classNames('app-multi-select', {
    'app-multi-select_disabled': disabled,
    'app-multi-select_multiline': multiline && value.length > 0,
  }, className);

  const mobileDrawerProps = isMobileMode && hasSearch 
    ? { mobileDrawerMaxHeight: '66.67vh', mobileDrawerFixedHeight: true } 
    : {};

  return (
    <div className={wrapperClassName}>
      <AppBaseDropdown
        {...baseDropdownProps}
        {...mobileDrawerProps}
        opened={isOpen}
        onClose={handleDropdownClose}
        toggle={renderToggle()}
        dropdown={isMobileMode ? renderMobileDrawer() : renderDropdown()}
        maxDropdownHeight={280}
        noRestrictHeigth={true}
      />
    </div>
  );
};

AppMultiSelect.displayName = 'AppMultiSelect';
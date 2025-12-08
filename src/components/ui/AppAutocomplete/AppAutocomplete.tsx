import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { AppInput, type AppInputRef } from '../AppInput';
import type { AppAutocompleteProps, SelectOption } from './AppAutocomplete.types';
import { ChevronDownIcon } from '../AppSingleSelect/ChevronDownIcon';
import { useDebounce, usePlatform } from '../../../hooks';
import './AppAutocomplete.css';

/**
 * AppAutocomplete - Компонент автокомплита с возможностью ввода произвольного значения
 * 
 * @example
 * ```tsx
 * // С локальными опциями
 * const options = [
 *   { label: 'Москва', value: 'moscow' },
 *   { label: 'Санкт-Петербург', value: 'spb' },
 * ];
 * 
 * <AppAutocomplete
 *   label="Город"
 *   options={options}
 *   value={city}
 *   onChange={setCity}
 * />
 * 
 * // С асинхронным поиском
 * <AppAutocomplete
 *   label="Город"
 *   onSearch={async (query) => {
 *     const response = await fetch(`/api/cities?q=${query}`);
 *     return response.json();
 *   }}
 *   value={city}
 *   onChange={setCity}
 *   minSearchLength={2}
 * />
 * ```
 */
export const AppAutocomplete: React.FC<AppAutocompleteProps> = ({
  value,
  onChange,
  options = [],
  onSearch,
  minSearchLength = 2,
  searchDebounce = 300,
  label,
  placeholder = 'Введите значение...',
  error,
  disabled = false,
  required = false,
  renderOption,
  filterOption,
  className,
  baseDropdownProps = {},
  // Пропсы для маски (прокидываются в AppInput)
  mask,
  unmask,
  placeholderChar,
  lazy,
  onAccept,
  onComplete,
}) => {
  const platform = usePlatform();
  const isMobileMode = platform === 'mobile';
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<AppInputRef>(null);
  const mobileInputRef = useRef<AppInputRef>(null);
  // Флаг для предотвращения повторного вызова onChange в handleDropdownClose после выбора
  const justSelectedRef = useRef(false);
  // Флаг для предотвращения поиска после выбора опции
  const isSelectingRef = useRef(false);
  // Флаг для предотвращения закрытия dropdown при клике на контейнер
  const justOpenedRef = useRef(false);

  // Debounced input value для асинхронного поиска
  const debouncedInputValue = useDebounce(inputValue, searchDebounce);

  // Синхронизация внутреннего состояния с внешним value
  useEffect(() => {
    if (value === undefined || value === null) {
      setInputValue('');
      return;
    }

    // Используем displayLabel если он есть (для масок), иначе label
    const valueToDisplay = (value as SelectOption & { displayLabel?: string }).displayLabel || value.label;
    setInputValue(valueToDisplay);
  }, [value]);

  // Определяем активный список опций
  const activeOptions = useMemo(() => {
    // Если есть onSearch и есть asyncOptions - используем их
    if (onSearch && asyncOptions.length > 0) {
      return asyncOptions;
    }
    // Иначе используем переданные options (статические опции)
    return options;
  }, [onSearch, asyncOptions, options]);

  // Фильтрация опций
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return activeOptions;

    const query = inputValue.toLowerCase();
    
    if (filterOption) {
      return activeOptions.filter(opt => filterOption(opt, inputValue));
    }

    return activeOptions.filter(opt =>
      opt.label.toLowerCase().includes(query)
    );
  }, [activeOptions, inputValue, filterOption]);

  // Асинхронный поиск
  useEffect(() => {
    if (!onSearch) return;
    
    // Если сейчас происходит выбор опции, пропускаем поиск
    if (isSelectingRef.current) {
      // НЕ сбрасываем флаг здесь - он будет сброшен в следующем цикле
      return;
    }
    
    // Если debouncedInputValue совпадает с displayLabel выбранного value,
    // значит это результат синхронизации после выбора, а не пользовательский ввод
    if (value && (value as SelectOption & { displayLabel?: string }).displayLabel) {
      const displayLabel = (value as SelectOption & { displayLabel?: string }).displayLabel!;
      // Убираем все символы кроме цифр и +
      const normalizedDebounced = debouncedInputValue.replace(/[^\d+]/g, '');
      const normalizedDisplay = displayLabel.replace(/[^\d+]/g, '');
      
      if (normalizedDebounced === normalizedDisplay) {
        return;
      }
    }
    
    if (debouncedInputValue.length < minSearchLength) {
      setAsyncOptions([]);
      setIsLoading(false);
      return;
    }

    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const results = await onSearch(debouncedInputValue);
        setAsyncOptions(results);
      } catch (error) {
        console.error('Error fetching autocomplete options:', error);
        setAsyncOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [debouncedInputValue, onSearch, minSearchLength, value]);

  // Обработчик изменения инпута
  const handleInputChange = useCallback((newValue: string) => {
    // Если используется маска, ПОЛНОСТЬЮ ИГНОРИРУЕМ это событие
    // т.к. всё будет обработано в handleMaskAccept
    if (mask) {
      return;
    }
    
    setInputValue(newValue);
    setHighlightedIndex(-1);
    
    // Открываем dropdown при вводе ТОЛЬКО если он закрыт
    // Это предотвращает повторные setIsOpen(true) при уже открытом dropdown
    if (newValue.length > 0 && !isOpen) {
      setIsOpen(true);
    }

    // Если очистили поле, вызываем onChange с пустым кастомным значением
    if (newValue === '') {
      onChange?.({ label: '', value: null, isCustom: true });
    }
  }, [isOpen, onChange, mask]);
  
  // Обработчик onAccept для маски
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMaskAccept = useCallback((maskedValue: string, maskRef: any) => {
    // Если сейчас происходит выбор опции, пропускаем обновление inputValue
    // Это предотвращает открытие dropdown после программного обновления маски
    if (isSelectingRef.current) {
      // НЕ сбрасываем флаг здесь - он будет сброшен через setTimeout в handleSelect
      // Вызываем оригинальный onAccept если он передан
      onAccept?.(maskedValue, maskRef);
      return;
    }
    
    // Обновляем inputValue только если значение изменилось
    if (maskedValue !== inputValue) {
      setInputValue(maskedValue);
    }
    setHighlightedIndex(-1);
    
    // Открываем dropdown при вводе ТОЛЬКО если он закрыт
    // Это предотвращает повторные setIsOpen(true) при уже открытом dropdown
    if (maskedValue.length > 0 && !isOpen) {
      setIsOpen(true);
    }
    
    // Вызываем оригинальный onAccept если он передан
    onAccept?.(maskedValue, maskRef);
  }, [inputValue, isOpen, onAccept]);

  // Обработчик выбора опции
  const handleSelect = useCallback((selectedOption: SelectOption) => {
    // Устанавливаем флаг что сейчас происходит выбор (предотвращаем поиск)
    isSelectingRef.current = true;
    
    // Используем displayLabel если он есть (для масок), иначе label
    const valueToDisplay = (selectedOption as SelectOption & { displayLabel?: string }).displayLabel || selectedOption.label;
    
    // Устанавливаем inputValue немедленно для отзывчивости UI
    setInputValue(valueToDisplay);
    
    // Вызываем onChange чтобы родитель обновил value prop
    onChange?.(selectedOption);
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    // Устанавливаем флаг что только что выбрали опцию
    justSelectedRef.current = true;
    
    // Сбрасываем isSelectingRef через 500ms после того как все useEffect отработают
    // (больше чем searchDebounce, чтобы гарантировать что debounced значение не вызовет поиск)
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 500);
    
    // Если используется маска, обновляем maskKey в AppInput
    // после того как React обновит value prop
    if (mask && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.updateMaskKey();
      }, 50); // Задержка для обновления props
    }
  }, [onChange, mask]);

  // Обработчик клика на контейнер - открываем dropdown
  const handleContainerClick = useCallback(() => {
    if (disabled) return;
    
    // Открываем dropdown если он закрыт
    // Фокус на input будет установлен через проп focused={isOpen}
    if (!isOpen) {
      justOpenedRef.current = true;
      setIsOpen(true);
      // Сбрасываем флаг после небольшой задержки
      setTimeout(() => {
        justOpenedRef.current = false;
      }, 100);
    }
  }, [disabled, isOpen]);
  
  // Обработчик закрытия dropdown от AppBaseDropdown (клик вне области)
  const handleDropdownClose = useCallback(() => {
    // Если только что открыли dropdown, игнорируем закрытие
    if (justOpenedRef.current) {
      return;
    }
    
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    // Если только что выбрали опцию, не обрабатываем значение
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    
    // Сохраняем значение инпута при закрытии
    if (inputValue !== '') {
      // Проверяем, есть ли точное совпадение в опциях
      const exactMatch = filteredOptions.find(
        opt => opt.label.toLowerCase() === inputValue.toLowerCase()
      );
      
      if (exactMatch) {
        onChange?.(exactMatch);
      } else {
        // Если нет совпадения, сохраняем как кастомное значение
        onChange?.({ 
          label: inputValue, 
          value: null, 
          isCustom: true 
        });
      }
    }
  }, [inputValue, filteredOptions, onChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else {
          // Если нет выделенной опции, просто закрываем
          // Значение сохранится через handleDropdownClose
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        // При Tab просто закрываем dropdown
        // Значение сохранится через handleDropdownClose
        setIsOpen(false);
        break;
    }
  }, [isOpen, highlightedIndex, filteredOptions, handleSelect]);

  // Рендер dropdown содержимого
  const renderDropdown = () => {

    return (
      <div className="app-autocomplete__dropdown" role="listbox">
        {isLoading ? (
          <div className="app-autocomplete__loading">Загрузка...</div>
        ) : filteredOptions.length > 0 ? (
          <div className="app-autocomplete__options-container">
            {filteredOptions.map((optionItem, index) => {
              const isHighlighted = index === highlightedIndex;
              const optionClassName = classNames('app-autocomplete__option', {
                'app-autocomplete__option_highlighted': isHighlighted,
              });

              return (
                <div
                  key={`${optionItem.value}-${index}`}
                  className={optionClassName}
                  onClick={() => handleSelect(optionItem)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  aria-selected={isHighlighted}
                >
                  {renderOption ? renderOption(optionItem) : optionItem.label}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  // Рендер toggle
  const renderToggle = () => {
    const arrowClassName = classNames('app-autocomplete__arrow', {
      'app-autocomplete__arrow_open': isOpen,
    });

    // В mobile mode toggle - это просто readonly input
    if (isMobileMode) {
      const displayValue = value?.label || '';
      
      return (
        <div className="app-autocomplete__input-container">
          <div className="app-autocomplete__input-wrapper">
            <AppInput
              value={displayValue}
              label={label}
              placeholder={placeholder}
              disabled={disabled}
              error={error}
              required={required}
              readOnly
              inputProps={{
                onClick: () => !disabled && setIsOpen(true),
              }}
            />
            <div className={arrowClassName} aria-hidden="true">
              <ChevronDownIcon color="#B2B1AE" size={20} />
            </div>
          </div>
        </div>
      );
    }

    // Desktop mode - обычный autocomplete input
    return (
      <div 
        className="app-autocomplete__input-container"
        onClick={handleContainerClick}
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        <div className="app-autocomplete__input-wrapper">
          <AppInput
            ref={inputRef}
            value={inputValue}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            required={required}
            onChange={handleInputChange}
            focused={isOpen}
            autoComplete="off"
            inputProps={{
              onKeyDown: handleKeyDown,
            }}
            // Пропсы для маски
            mask={mask}
            unmask={unmask}
            placeholderChar={placeholderChar}
            lazy={lazy}
            onAccept={handleMaskAccept}
            onComplete={onComplete}
          />
          <div className={arrowClassName} aria-hidden="true">
            <ChevronDownIcon color="#B2B1AE" size={20} />
          </div>
        </div>
      </div>
    );
  };

  // Рендер mobile drawer содержимого
  const renderMobileDrawer = () => {
    return (
      <div className="app-autocomplete__mobile-drawer">
        <div className="app-autocomplete__mobile-search">
          <AppInput
            ref={mobileInputRef}
            value={inputValue}
            placeholder={placeholder || 'Поиск...'}
            onChange={handleInputChange}
            autoComplete="off"
            autoFocus
            // Пропсы для маски
            mask={mask}
            unmask={unmask}
            placeholderChar={placeholderChar}
            lazy={lazy}
            onAccept={handleMaskAccept}
            onComplete={onComplete}
          />
        </div>
        
        <div className="app-autocomplete__mobile-options">
          {/* Показываем введённое значение как опцию, если есть inputValue и достаточная длина */}
          {inputValue.trim() && inputValue.length >= minSearchLength && (
            <div
              className="app-autocomplete__mobile-option app-autocomplete__mobile-option_custom"
              onClick={() => handleSelect({ 
                label: inputValue, 
                value: null, 
                isCustom: true 
              })}
            >
              {inputValue}
            </div>
          )}
          
          {isLoading ? (
            <div className="app-autocomplete__mobile-loading">Загрузка...</div>
          ) : (
            <>
              {/* Показываем найденные опции */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((optionItem, index) => (
                  <div
                    key={`${optionItem.value}-${index}`}
                    className="app-autocomplete__mobile-option"
                    onClick={() => handleSelect(optionItem)}
                  >
                    {renderOption ? renderOption(optionItem) : optionItem.label}
                  </div>
                ))
              ) : inputValue.length < minSearchLength ? (
                <div className="app-autocomplete__mobile-no-options">
                  {`Введите минимум ${minSearchLength} символа`}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    );
  };

  const wrapperClassName = classNames('app-autocomplete', {
    'app-autocomplete_disabled': disabled,
  }, className);

  return (
    <div className={wrapperClassName}>
      <AppBaseDropdown
        {...baseDropdownProps}
        opened={isOpen}
        onClose={handleDropdownClose}
        toggle={renderToggle()}
        dropdown={isMobileMode ? renderMobileDrawer() : renderDropdown()}
        maxDropdownHeight={280}
        noRestrictHeigth={true}
        mobileDrawerMaxHeight="66.67vh"
        mobileDrawerFixedHeight={true}
      />
    </div>
  );
};

AppAutocomplete.displayName = 'AppAutocomplete';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { AppInput, type AppInputRef } from '../AppInput';
import type { AppAutocompleteProps, SelectOption } from './AppAutocomplete.types';
import { ChevronDownIcon } from '../AppSingleSelect/ChevronDownIcon';
import { useDebounce } from '../../../hooks';
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
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<AppInputRef>(null);
  // Флаг для предотвращения повторного вызова onChange в handleBlur после выбора
  const justSelectedRef = useRef(false);

  // Debounced input value для асинхронного поиска
  const debouncedInputValue = useDebounce(inputValue, searchDebounce);
  
  // Логируем debouncedInputValue когда он меняется
  useEffect(() => {
    if (onSearch && debouncedInputValue) {
      console.log('⏱️ AppAutocomplete: debouncedInputValue changed:', { debouncedInputValue, minSearchLength });
    }
  }, [debouncedInputValue, onSearch, minSearchLength]);

  // Синхронизация внутреннего состояния с внешним value
  useEffect(() => {
    if (value === undefined || value === null) {
      setInputValue('');
      return;
    }

    // Используем displayLabel если он есть (для масок), иначе label
    const valueToDisplay = (value as SelectOption & { displayLabel?: string }).displayLabel || value.label;
    console.log('🔄 AppAutocomplete: syncing value to inputValue', {
      valueLabel: value.label,
      displayLabel: (value as SelectOption & { displayLabel?: string }).displayLabel,
      valueToDisplay,
    });
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
  }, [debouncedInputValue, onSearch, minSearchLength]);

  // Обработчик изменения инпута
  const handleInputChange = useCallback((newValue: string) => {
    console.log('⌨️ AppAutocomplete: handleInputChange called:', { newValue });
    // Если используется маска, не обновляем inputValue здесь
    // т.к. это будет сделано в handleMaskAccept
    if (!mask) {
      setInputValue(newValue);
    }
    setHighlightedIndex(-1);
    
    // Открываем dropdown при вводе
    if (!isOpen && newValue.length > 0) {
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
    console.log('🎭 AppAutocomplete: handleMaskAccept called:', { maskedValue });
    // Обновляем inputValue с masked значением
    setInputValue(maskedValue);
    setHighlightedIndex(-1);
    
    // Открываем dropdown при вводе
    if (!isOpen && maskedValue.length > 0) {
      setIsOpen(true);
    }
    
    // Вызываем оригинальный onAccept если он передан
    onAccept?.(maskedValue, maskRef);
  }, [isOpen, onAccept]);

  // Обработчик выбора опции
  const handleSelect = useCallback((selectedOption: SelectOption) => {
    // Используем displayLabel если он есть (для масок), иначе label
    const valueToDisplay = (selectedOption as SelectOption & { displayLabel?: string }).displayLabel || selectedOption.label;
    console.log('✅ AppAutocomplete: handleSelect', {
      optionLabel: selectedOption.label,
      displayLabel: (selectedOption as SelectOption & { displayLabel?: string }).displayLabel,
      valueToDisplay,
    });
    setInputValue(valueToDisplay);
    onChange?.(selectedOption);
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    // Устанавливаем флаг что только что выбрали опцию
    justSelectedRef.current = true;
    
    // Если используется маска, обновляем maskKey в AppInput
    if (mask && inputRef.current) {
      // Используем setTimeout чтобы дать время React обновить value в AppInput
      setTimeout(() => {
        inputRef.current?.updateMaskKey();
      }, 0);
    }
  }, [onChange, mask]);

  // Обработчик фокуса
  const handleFocus = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  // Обработчик потери фокуса
  const handleBlur = useCallback(() => {
    // Если только что выбрали опцию, не вызываем onChange снова
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    
    // Сохраняем текущее значение инпута
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

  // Обработчик закрытия dropdown
  const handleDropdownClose = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    handleBlur();
  }, [handleBlur]);

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
          // Если нет выделенной опции, закрываем и сохраняем текущее значение
          setIsOpen(false);
          handleBlur();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        // При Tab закрываем dropdown и сохраняем текущее значение
        setIsOpen(false);
        handleBlur();
        break;
    }
  }, [isOpen, highlightedIndex, filteredOptions, handleSelect, handleBlur]);

  // Рендер dropdown содержимого
  const renderDropdown = () => {
    // Не показываем dropdown если нет опций и нет загрузки
    if (!isLoading && filteredOptions.length === 0) {
      return null;
    }

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

    return (
      <div className="app-autocomplete__input-container">
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
            onFocus={handleFocus}
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
        dropdown={renderDropdown()}
        maxDropdownHeight={280}
        noRestrictHeigth={true}
      />
    </div>
  );
};

AppAutocomplete.displayName = 'AppAutocomplete';

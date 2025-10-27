import React, { useState, useCallback, useMemo } from 'react';
import { AppBaseDropdown } from '../AppBaseDropdown';
import { AppInput } from '../AppInput';
import type { AppSingleSelectProps, SelectOption } from './AppSingleSelect.types';
import { ChevronDownIcon } from './ChevronDownIcon';
import {
  SelectWrapper,
  InputContainer,
  InputWrapper,
  ClearButton,
  ArrowIconWrapper,
  DropdownContent,
  OptionsContainer,
  SearchInput,
  Option,
  OptionCheck,
  NoOptions,
} from './AppSingleSelect.styles';

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

    return (
      <InputContainer $errored={!!error} $isOpen={isOpen}>
        <InputWrapper onClick={handleInputClick}>
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
            <ClearButton onClick={handleClear} type="button" aria-label="Очистить">
              ×
            </ClearButton>
          )}
          <ArrowIconWrapper $isOpen={isOpen} aria-hidden="true">
            <ChevronDownIcon color="#B2B1AE" size={20} />
          </ArrowIconWrapper>
        </InputWrapper>
      </InputContainer>
    );
  };

  // Рендер dropdown (кастомный или дефолтный)
  const renderDropdown = () => {
    if (dropdown) return dropdown;

    return (
      <DropdownContent role="listbox">
        {/* Поиск показывается только для списков > 10 элементов */}
        {options.length > 10 && (
          <SearchInput
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Поиск по опциям"
          />
        )}
        <OptionsContainer>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((optionItem) => (
              <Option
                key={optionItem.value}
                $selected={value?.value === optionItem.value}
                onClick={() => handleSelect(optionItem)}
                role="option"
                aria-selected={value?.value === optionItem.value}
              >
                {option || optionItem.label}
                {value?.value === optionItem.value && (
                  <OptionCheck aria-hidden="true">✓</OptionCheck>
                )}
              </Option>
            ))
          ) : (
            <NoOptions role="status">Ничего не найдено</NoOptions>
          )}
        </OptionsContainer>
      </DropdownContent>
    );
  };

  return (
    <SelectWrapper $disabled={disabled} className={className}>
      <AppBaseDropdown
        {...baseDropdownProps}
        opened={isOpen}
        onClose={handleDropdownClose}
        toggle={renderToggle()}
        dropdown={renderDropdown()}
        maxDropdownHeight={280}
        noRestrictHeigth={true}
      />
    </SelectWrapper>
  );
};

AppSingleSelect.displayName = 'AppSingleSelect';
import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import type { AppCheckboxProps, StyledCheckboxProps } from './AppCheckbox.types';

/**
 * Контейнер для чекбокса с лейблом
 */
const CheckboxWrapper = styled.label<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  position: relative;
  vertical-align: top;
  line-height: 0;
`;

/**
 * Скрытый нативный input
 */
const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`;

/**
 * Кастомный визуальный чекбокс
 */
const CustomCheckbox = styled.span<StyledCheckboxProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  /* Размеры */
  ${({ $size }) => $size === 'S' && css`
    width: 20px;
    height: 20px;
  `}
  
  ${({ $size }) => $size === 'M' && css`
    width: 24px;
    height: 24px;
  `}
  
  /* Primary - не выбрано - Default */
  ${({ $variant, $checked, $indeterminate, $disabled, theme }) => 
    $variant === 'primary' && !$checked && !$indeterminate && !$disabled && css`
      border: 1.5px solid ${theme.colors.gray[200]};
      background-color: ${theme.colors.gray[25]};
      
      ${CheckboxWrapper}:hover & {
        border-color: ${theme.colors.gray[900]};
        box-shadow: 0 0 0 2px rgba(48, 47, 45, 0.05);
      }
      
      ${CheckboxWrapper}:active & {
        box-shadow: 0 0 0 2px rgba(48, 47, 45, 0.1);
      }
    `}
  
  /* Primary - выбрано - Default */
  ${({ $variant, $checked, $indeterminate, $disabled, theme }) => 
    $variant === 'primary' && ($checked || $indeterminate) && !$disabled && css`
      border: 1.5px solid ${theme.colors.gray[900]};
      background-color: ${theme.colors.gray[900]};
      
      ${CheckboxWrapper}:hover & {
        background-color: #1F1E1B;
        border-color: #1F1E1B;
        box-shadow: 0 0 0 2px rgba(48, 47, 45, 0.05);
      }
      
      ${CheckboxWrapper}:active & {
        box-shadow: 0 0 0 2px rgba(48, 47, 45, 0.1);
      }
    `}
  
  /* Primary - Disabled */
  ${({ $variant, $checked, $indeterminate, $disabled, theme }) => 
    $variant === 'primary' && $disabled && css`
      border: 1.5px solid ${($checked || $indeterminate) ? theme.colors.gray[200] : theme.colors.gray[200]};
      background-color: ${($checked || $indeterminate) ? theme.colors.gray[200] : 'transparent'};
      opacity: 0.6;
    `}
  
  /* Secondary - не выбрано - Default */
  ${({ $variant, $checked, $indeterminate, $disabled }) => 
    $variant === 'secondary' && !$checked && !$indeterminate && !$disabled && css`
      border: 1.5px solid #FFFFFF;
      background-color: transparent;
      
      ${CheckboxWrapper}:hover & {
        border-color: #FFFFFF;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
      }
      
      ${CheckboxWrapper}:active & {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
      }
    `}
  
  /* Secondary - выбрано - Default */
  ${({ $variant, $checked, $indeterminate, $disabled }) => 
    $variant === 'secondary' && ($checked || $indeterminate) && !$disabled && css`
      border: 1.5px solid #FFFFFF;
      background-color: #FFFFFF;
      
      ${CheckboxWrapper}:hover & {
        background-color: #F5F5F5;
        border-color: #F5F5F5;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
      }
      
      ${CheckboxWrapper}:active & {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
      }
    `}
  
  /* Secondary - Disabled */
  ${({ $variant, $checked, $indeterminate, $disabled, theme }) => 
    $variant === 'secondary' && $disabled && css`
      border: 1.5px solid ${($checked || $indeterminate) ? theme.colors.gray[100] : '#FFFFFF'};
      background-color: ${($checked || $indeterminate) ? theme.colors.gray[100] : 'transparent'};
      opacity: 0.6;
    `}
  
  /* Focus indicator для accessibility */
  ${HiddenInput}:focus-visible + & {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

/**
 * SVG иконка галочки для checked состояния
 */
const CheckIcon = styled.svg<{ $size: 'S' | 'M'; $variant: 'primary' | 'secondary'; $disabled: boolean }>`
  width: ${({ $size }) => ($size === 'S' ? '12px' : '16px')};
  height: ${({ $size }) => ($size === 'S' ? '12px' : '16px')};
  fill: none;
  stroke: ${({ $variant, $disabled, theme }) => {
    if ($disabled) {
      return $variant === 'primary' ? '#FFFFFF' : theme.colors.gray[200];
    }
    return $variant === 'primary' ? '#FFFFFF' : theme.colors.gray[900];
  }};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: all 0.15s ease;
  
  /* Анимация появления галочки */
  opacity: 0;
  transform: scale(0.5);
  animation: checkmark-appear 0.15s ease forwards;
  
  @keyframes checkmark-appear {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

/**
 * Линия для indeterminate состояния
 */
const IndeterminateLine = styled.div<{ $size: 'S' | 'M'; $variant: 'primary' | 'secondary'; $disabled: boolean }>`
  width: ${({ $size }) => ($size === 'S' ? '10px' : '12px')};
  height: 2px;
  border-radius: 1px;
  background-color: ${({ $variant, $disabled, theme }) => {
    if ($disabled) {
      return $variant === 'primary' ? '#FFFFFF' : theme.colors.gray[200];
    }
    return $variant === 'primary' ? '#FFFFFF' : theme.colors.gray[900];
  }};
  transition: all 0.15s ease;
  
  /* Анимация появления линии */
  opacity: 0;
  transform: scale(0.5);
  animation: line-appear 0.15s ease forwards;
  
  @keyframes line-appear {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

/**
 * Текст лейбла
 */
const LabelText = styled.span<{ $disabled: boolean }>`
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 16px;
  line-height: 1.2;
  color: ${({ theme, $disabled }) => 
    $disabled ? theme.colors.gray[400] : theme.colors.gray[900]};
  transition: color 0.2s ease;
  display: inline-block;
`;

/**
 * Компонент AppCheckbox
 */
const AppCheckbox: React.FC<AppCheckboxProps> = ({
  checked: controlledChecked,
  indeterminate = false,
  disabled = false,
  size = 'M',
  variant = 'primary',
  onChange,
  label,
  className,
  'data-testid': dataTestId,
}) => {
  // Внутреннее состояние для uncontrolled режима
  const [internalChecked, setInternalChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Определяем, является ли компонент controlled или uncontrolled
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;
  
  // Устанавливаем indeterminate через ref (невозможно через атрибут)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  // Обработчик изменения
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    if (!isControlled) {
      setInternalChecked(event.target.checked);
    }
    
    onChange?.(event);
  };
  
  // Обработчик клавиатуры
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // Space для переключения (Enter уже работает с label)
    if (event.key === ' ') {
      event.preventDefault();
      if (inputRef.current) {
        inputRef.current.click();
      }
    }
  };

  return (
    <CheckboxWrapper
      $disabled={disabled}
      className={className}
      data-testid={dataTestId}
    >
      <HiddenInput
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
        role="checkbox"
      />
      
      <CustomCheckbox
        $size={size}
        $variant={variant}
        $checked={checked}
        $indeterminate={indeterminate}
        $disabled={disabled}
      >
        {indeterminate ? (
          <IndeterminateLine
            $size={size}
            $variant={variant}
            $disabled={disabled}
          />
        ) : checked && (
          <CheckIcon
            $size={size}
            $variant={variant}
            $disabled={disabled}
            viewBox="0 0 16 16"
          >
            <polyline points="3,8 6,11 13,4" />
          </CheckIcon>
        )}
      </CustomCheckbox>
      
      {label && (
        <LabelText $disabled={disabled}>
          {label}
        </LabelText>
      )}
    </CheckboxWrapper>
  );
};

export default AppCheckbox;

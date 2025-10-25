import React, { useId } from 'react';
import styled, { css } from 'styled-components';
import type { AppRadioProps, StyledRadioProps } from './AppRadio.types';

/**
 * Контейнер для радио-кнопки с лейблом
 */
const RadioWrapper = styled.label<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  position: relative;
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
 * Кастомная визуальная радио-кнопка
 */
const CustomRadio = styled.span<StyledRadioProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  /* Размеры */
  ${({ $size }) => $size === 'M' && css`
    width: 20px;
    height: 20px;
  `}
  
  ${({ $size }) => $size === 'L' && css`
    width: 28px;
    height: 28px;
  `}
  
  /* Состояния - Default (не выбрано) */
  ${({ $checked, $disabled, theme }) => !$checked && !$disabled && css`
    border: 1.5px solid ${theme.colors.gray[900]};
    background-color: transparent;
    
    ${RadioWrapper}:hover & {
      border-color: ${theme.colors.gray[900]};
      box-shadow: 0 0 0 2px rgba(48, 47, 45, 0.1);
    }
    
    ${RadioWrapper}:active & {
      box-shadow: 0 0 0 2px rgba(48, 47, 45, 0.2);
    }
  `}
  
  /* Состояния - Selected (выбрано) */
  ${({ $checked, $disabled, theme }) => $checked && !$disabled && css`
    border: 1.5px solid ${theme.colors.gray[900]};
    background-color: transparent;
    
    ${RadioWrapper}:hover & {
      box-shadow: 0 0 0 2px rgba(48, 47, 45, 0.1);
    }
    
    ${RadioWrapper}:active & {
      box-shadow: 0 0 0 2px rgba(48, 47, 45, 0.2);
    }
  `}
  
  /* Состояния - Disabled */
  ${({ $disabled, theme }) => $disabled && css`
    border: 1.5px solid ${theme.colors.gray[400]};
    background-color: transparent;
    opacity: 0.6;
  `}
  
  /* Фокус для доступности */
  ${HiddenInput}:focus-visible + & {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

/**
 * Внутренний круг (индикатор выбора)
 */
const RadioIndicator = styled.span<StyledRadioProps>`
  display: block;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  /* Размеры индикатора */
  ${({ $size }) => $size === 'M' && css`
    width: 8px;
    height: 8px;
  `}
  
  ${({ $size }) => $size === 'L' && css`
    width: 12px;
    height: 12px;
  `}
  
  /* Цвет индикатора */
  ${({ $checked, $disabled, theme }) => {
    if ($checked && !$disabled) {
      return css`background-color: ${theme.colors.gray[900]};`;
    }
    if ($checked && $disabled) {
      return css`background-color: ${theme.colors.gray[400]};`;
    }
    return css`
      background-color: transparent;
      transform: scale(0);
    `;
  }}
  
  /* Анимация появления */
  ${({ $checked }) => $checked && css`
    transform: scale(1);
  `}
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
`;

/**
 * Компонент радио-кнопки
 */
const AppRadio: React.FC<AppRadioProps> = ({
  checked = false,
  disabled = false,
  size = 'L',
  name,
  value,
  onChange,
  label,
  className,
  'data-testid': dataTestId,
}) => {
  // Генерируем уникальный ID для связи input и label
  const generatedId = useId();
  const inputId = `app-radio-${generatedId}`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onChange?.(event);
  };

  return (
    <RadioWrapper
      htmlFor={inputId}
      $disabled={disabled}
      className={className}
      data-testid={dataTestId}
    >
      <HiddenInput
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        aria-checked={checked}
        aria-disabled={disabled}
      />
      
      <CustomRadio
        $size={size}
        $disabled={disabled}
        $checked={checked}
      >
        <RadioIndicator
          $size={size}
          $disabled={disabled}
          $checked={checked}
        />
      </CustomRadio>
      
      {label && (
        <LabelText $disabled={disabled}>
          {label}
        </LabelText>
      )}
    </RadioWrapper>
  );
};

export default AppRadio;

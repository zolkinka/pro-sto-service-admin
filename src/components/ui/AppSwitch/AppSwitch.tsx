import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import type { AppSwitchProps, StyledSwitchProps } from './AppSwitch.types';

// Контейнер для переключателя
const SwitchWrapper = styled.label<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
`;

// Скрытый нативный input для доступности
const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

// Контейнер переключателя (track)
const SwitchTrack = styled.div<StyledSwitchProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: ${({ $size }) => ($size === 'L' ? '14px' : '12px')};
  transition: background-color 0.2s ease;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  outline: none;
  flex-shrink: 0;
  
  /* Размеры */
  ${({ $size }) => $size === 'L' && css`
    width: 44px;
    height: 24px;
    padding: 2px;
  `}
  
  ${({ $size }) => $size === 'M' && css`
    width: 36px;
    height: 20px;
    padding: 2px;
  `}
  
  /* Цвета в зависимости от состояния */
  ${({ $checked, $disabled, theme }) => {
    if ($disabled) {
      return css`
        background-color: ${theme.colors.gray[100]};
        opacity: 0.6;
      `;
    }
    
    if ($checked) {
      return css`
        background-color: ${theme.colors.gray[900]};
        
        ${SwitchWrapper}:hover & {
          background-color: #1F1E1B;
        }
      `;
    }
    
    return css`
      background-color: ${theme.colors.gray[400]};
      
      ${SwitchWrapper}:hover & {
        background-color: #D0D0D0;
      }
    `;
  }}
  
  /* Focus indicator для accessibility */
  ${HiddenInput}:focus-visible ~ & {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

// Ползунок (thumb)
const SwitchThumb = styled.div<StyledSwitchProps>`
  background-color: ${({ theme }) => theme.colors.gray[25]};
  border-radius: 50%;
  transition: transform 0.2s ease;
  position: relative;
  
  /* Размеры ползунка */
  ${({ $size }) => $size === 'L' && css`
    width: 20px;
    height: 20px;
  `}
  
  ${({ $size }) => $size === 'M' && css`
    width: 16px;
    height: 16px;
  `}
  
  /* Позиция в зависимости от состояния checked */
  ${({ $checked, $size }) => {
    if ($checked) {
      if ($size === 'L') {
        return css`
          transform: translateX(20px);
        `;
      }
      return css`
        transform: translateX(16px);
      `;
    }
    return css`
      transform: translateX(0);
    `;
  }}
`;

// Label текст
const LabelText = styled.span<{ $disabled: boolean }>`
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme, $disabled }) => 
    $disabled ? theme.colors.gray[400] : theme.colors.gray[900]};
`;

// Основной компонент
const AppSwitch: React.FC<AppSwitchProps> = ({
  checked: controlledChecked,
  disabled = false,
  size = 'L',
  onChange,
  label,
  className,
  'data-testid': dataTestId,
}) => {
  // Внутреннее состояние для uncontrolled режима
  const [internalChecked, setInternalChecked] = useState(false);
  
  // Определяем, является ли компонент controlled или uncontrolled
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;
  
  // Обработчик переключения
  const handleToggle = () => {
    if (disabled) return;
    
    const newChecked = !checked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked);
  };
  
  // Обработчик клавиатуры
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    // Space или Enter для переключения
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <SwitchWrapper 
      className={className}
      $disabled={disabled}
      data-testid={dataTestId}
    >
      <HiddenInput
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleToggle}
        onKeyDown={handleKeyDown}
        aria-checked={checked}
        role="switch"
        tabIndex={disabled ? -1 : 0}
      />
      
      <SwitchTrack
        $size={size}
        $checked={checked}
        $disabled={disabled}
        role="presentation"
        aria-hidden="true"
      >
        <SwitchThumb
          $size={size}
          $checked={checked}
          $disabled={disabled}
        />
      </SwitchTrack>
      
      {label && (
        <LabelText $disabled={disabled}>
          {label}
        </LabelText>
      )}
    </SwitchWrapper>
  );
};

export default AppSwitch;

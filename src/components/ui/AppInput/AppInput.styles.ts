import styled from 'styled-components';
import type { 
  InputWrapperProps, 
  StyledLabelProps, 
  InputContainerProps, 
  StyledInputProps, 
  RequiredIndicatorProps 
} from './AppInput.types';

// Wrapper для всего компонента
export const InputWrapper = styled.div<InputWrapperProps>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`;

// Label
export const StyledLabel = styled.label<StyledLabelProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme, $error }) => 
    $error ? theme.colors.red[300] : theme.colors.gray[800]};
`;

// Индикатор обязательного поля (*)
export const RequiredIndicator = styled.span<RequiredIndicatorProps>`
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme, $error }) => 
    $error ? theme.colors.red[300] : theme.colors.red[400]};
`;

// Контейнер для input + иконок
export const InputContainer = styled.div<InputContainerProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid;
  border-radius: ${({ $size, $roundedBottom }) => {
    const radius = $size === 'M' ? '12px' : '16px';
    if ($roundedBottom === false) {
      return `${radius} ${radius} 0 0`;
    }
    return radius;
  }};
  height: ${({ $size }) => ($size === 'M' ? '40px' : '52px')};
  background: ${({ $background, theme }) =>
    $background === 'muted' ? theme.colors.gray[25] : theme.colors.gray[100]};
  border-color: ${({ $error, theme, $isFocused }) => {
    if ($error) return theme.colors.red[400];
    if ($isFocused) return theme.colors.primary[500];
    return theme.colors.gray[200];
  }};
  transition: all 0.2s ease;

  &:hover:not([data-disabled="true"]) {
    border-color: ${({ theme, $error, $isFocused }) => {
      if ($error) return theme.colors.red[400];
      if ($isFocused) return theme.colors.primary[500];
      return theme.colors.gray[600];
    }};
  }

  &:focus-within {
    border-color: ${({ theme, $error }) => 
      $error ? theme.colors.red[400] : theme.colors.primary[500]};
    outline: none;
  }
`;

// Сам input
export const StyledInput = styled.input<StyledInputProps>`
  flex: 1;
  min-width: 0; /* Позволяет input сжиматься когда есть suffix */
  border: none;
  outline: none;
  background: transparent;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: ${({ $size }) => ($size === 'M' ? '14px' : '15px')};
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.gray[400] : theme.colors.gray[900]};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[500]};
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:disabled {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.gray[400]};
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.gray[400]};
    }
  }

  /* Убираем стрелки для input type="number" */
  &[type='number'] {
    -moz-appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;

// Контейнер для иконки
export const IconContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg, img {
    width: 16px;
    height: 16px;
    display: block;
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

// Суффикс (постфикс) - текст справа от input
export const SuffixText = styled.span`
  display: inline-flex;
  align-items: center;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap;
  user-select: none;
`;

// Текст ошибки
export const ErrorText = styled.span`
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.red[300]};
`;
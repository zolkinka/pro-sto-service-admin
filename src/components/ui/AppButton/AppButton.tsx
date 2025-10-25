import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import type { AppButtonProps, StyledButtonProps } from './AppButton.types';

// Анимация загрузки
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Спиннер для состояния loading
const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Контейнер для иконки
const IconContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg, img {
    width: 16px;
    height: 16px;
    display: block;
  }
`;

// Функция для получения стилей вариантов
const getVariantStyles = (variant: string, theme: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const variants = {
    primary: css`
      background-color: ${theme.colors.gray[900]};
      color: ${theme.colors.gray[25]};
      border: none;
      
      &:hover:not(:disabled) {
        background-color: #2A2925;
      }
      
      &:active:not(:disabled) {
        background-color: #1F1E1B;
      }
    `,
    
    secondary: css`
      background-color: ${theme.colors.gray[200]};
      color: ${theme.colors.gray[900]};
      border: none;
      
      &:hover:not(:disabled) {
        background-color: #E8E7E4;
      }
      
      &:active:not(:disabled) {
        background-color: #DCDBD8;
      }
    `,
    
    danger: css`
      background-color: transparent;
      color: ${theme.colors.error[500]};
      border: none;
      
      &:hover:not(:disabled) {
        background-color: rgba(232, 48, 70, 0.1);
      }
      
      &:active:not(:disabled) {
        background-color: rgba(232, 48, 70, 0.2);
      }
    `,
    
    invisible: css`
      background-color: transparent;
      color: ${theme.colors.gray[900]};
      border: none;
      
      &:hover:not(:disabled) {
        background-color: rgba(48, 47, 45, 0.1);
      }
      
      &:active:not(:disabled) {
        background-color: rgba(48, 47, 45, 0.2);
      }
    `,
    
    default: css`
      background-color: ${theme.colors.gray[200]};
      color: ${theme.colors.gray[900]};
      border: 1px solid ${theme.colors.gray[300]};
      
      &:hover:not(:disabled) {
        background-color: #E8E7E4;
        border-color: ${theme.colors.gray[400]};
      }
      
      &:active:not(:disabled) {
        background-color: #DCDBD8;
        border-color: ${theme.colors.gray[400]};
      }
    `,
  };
  
  return variants[variant as keyof typeof variants] || variants.default;
};

// Основной styled-компонент
const StyledButton = styled.button<StyledButtonProps>`
  /* Базовые стили */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-weight: 400;
  line-height: 1.2;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  outline: none;
  
  /* Фокус для доступности */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  /* Размеры */
  ${({ $size }) => $size === 'M' && css`
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
    gap: 8px;
  `}
  
  ${({ $size }) => $size === 'L' && css`
    height: 50px;
    padding: 0 20px;
    font-size: 16px;
    gap: 10px;
  `}
  
  /* Варианты */
  ${({ $variant, theme }) => getVariantStyles($variant, theme)}
  
  /* Состояния */
  ${({ $disabled }) => $disabled && css`
    cursor: not-allowed;
    opacity: 0.6;
  `}
  
  ${({ $loading }) => $loading && css`
    cursor: wait;
  `}
  
  /* Только иконка */
  ${({ $onlyIcon, $size }) => $onlyIcon && css`
    width: ${$size === 'M' ? '40px' : '50px'};
    padding: 0;
  `}
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-height: 44px;
  }
`;

// Основной компонент
const AppButton: React.FC<AppButtonProps> = ({
  children,
  size = 'L',
  variant = 'primary',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  onlyIcon = false,
  onClick,
  type = 'button',
  className,
  'data-testid': dataTestId,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <StyledButton
      type={type}
      className={className}
      data-testid={dataTestId}
      $size={size}
      $variant={variant}
      $disabled={disabled}
      $loading={loading}
      $onlyIcon={onlyIcon}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <Spinner />}
      
      {!loading && iconLeft && (
        <IconContainer>
          {iconLeft}
        </IconContainer>
      )}
      
      {!onlyIcon && children && (
        <span>{children}</span>
      )}
      
      {!loading && iconRight && (
        <IconContainer>
          {iconRight}
        </IconContainer>
      )}
      
      {onlyIcon && !loading && (iconLeft || iconRight) && (
        <IconContainer>
          {iconLeft || iconRight}
        </IconContainer>
      )}
    </StyledButton>
  );
};

export default AppButton;
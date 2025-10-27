import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import type { AppTagProps, StyledTagProps } from './AppTag.types';

// Анимация исчезновения
const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
`;

// Контейнер кнопки закрытия
const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
  outline: none;
  
  &:hover {
    opacity: 0.7;
  }
  
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
    border-radius: 2px;
  }
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

// Функция для получения стилей цветов
const getColorStyles = (color: string) => {
  const colors = {
    default: css`
      background-color: #F9F8F5;
      color: #73716F;
    `,
    blue: css`
      background-color: #EEF0FC;
      color: #4169E3;
    `,
    red: css`
      background-color: #FBDFE2;
      color: #D8182E;
    `,
    yellow: css`
      background-color: #F9ECD2;
      color: #CC8D18;
    `,
    green: css`
      background-color: #DEF7E7;
      color: #0AB878;
    `,
  };
  
  return colors[color as keyof typeof colors] || colors.default;
};

// Основной styled-компонент
const StyledTag = styled.div<StyledTagProps & { $isClosing: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-weight: 400;
  line-height: 1.2;
  transition: all 0.2s ease;
  
  /* Размеры */
  ${({ $size }) => $size === 'M' && css`
    height: 22px;
    padding: 0 8px;
    font-size: 14px;
    border-radius: 10px;
    gap: 4px;
  `}
  
  ${({ $size }) => $size === 'S' && css`
    height: 18px;
    padding: 0 6px;
    font-size: 12px;
    border-radius: 8px;
    gap: 4px;
  `}
  
  /* Цвета */
  ${({ $color }) => getColorStyles($color)}
  
  /* Анимация исчезновения */
  ${({ $isClosing }) => $isClosing && css`
    animation: ${fadeOut} 0.2s ease forwards;
  `}
  
  /* Текст */
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

// Иконка закрытия (×)
const CloseIcon: React.FC = () => (
  <svg
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Основной компонент
const AppTag: React.FC<AppTagProps> = ({
  children,
  size = 'M',
  color = 'default',
  closable = false,
  onClose,
  className,
  'data-testid': dataTestId,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    
    setIsClosing(true);
    
    // Ждем завершения анимации перед скрытием
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <StyledTag
      className={className}
      data-testid={dataTestId}
      $size={size}
      $color={color}
      $closable={closable}
      $isClosing={isClosing}
      role="status"
      aria-label={typeof children === 'string' ? children : undefined}
    >
      <span>{children}</span>
      
      {closable && (
        <CloseButton
          onClick={handleClose}
          aria-label="Удалить тег"
          type="button"
          tabIndex={0}
        >
          <CloseIcon />
        </CloseButton>
      )}
    </StyledTag>
  );
};

export default AppTag;

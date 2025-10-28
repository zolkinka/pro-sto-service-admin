import React, { useState } from 'react';
import classNames from 'classnames';
import type { AppTagProps } from './AppTag.types';
import './AppTag.css';

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
export const AppTag: React.FC<AppTagProps> = ({
  children,
  size = 'M',
  color = 'default',
  closable = false,
  onClose,
  className,
  ...rest
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    // Запускаем анимацию закрытия
    setIsClosing(true);
    
    // После окончания анимации скрываем и вызываем callback
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200); // Длительность fadeOut анимации
  };
  
  if (!isVisible) return null;
  
  const tagClassName = classNames(
    'app-tag',
    `app-tag_size_${size.toLowerCase()}`,
    `app-tag_color_${color}`,
    {
      'app-tag_closing': isClosing,
    },
    className
  );
  
  return (
    <div className={tagClassName} {...rest}>
      <span className="app-tag__text">{children}</span>
      {closable && (
        <button
          type="button"
          className="app-tag__close"
          onClick={handleClose}
          aria-label="Закрыть"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default AppTag;

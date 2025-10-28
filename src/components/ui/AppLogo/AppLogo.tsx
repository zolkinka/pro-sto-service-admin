import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { ROUTES } from '@/constants/routes';
import type { AppLogoProps } from './AppLogo.types';
import './AppLogo.css';

const AppLogo: React.FC<AppLogoProps> = ({
  className,
  onClick,
  'data-testid': dataTestId = 'app-logo',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const logoClassName = classNames('app-logo', className);

  return (
    <div
      className={logoClassName}
      onClick={handleClick}
      data-testid={dataTestId}
      role="button"
      aria-label="Перейти на главную"
    >
      <img className="app-logo__image" src="/logo.svg" alt="просто" />
    </div>
  );
};

export default AppLogo;

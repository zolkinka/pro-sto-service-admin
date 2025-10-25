import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ROUTES } from '@/constants/routes';
import type { AppLogoProps } from './AppLogo.types';

const LogoContainer = styled.div`
  width: 167px;
  height: 43px;
  cursor: pointer;
  display: inline-flex;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    opacity: 0.6;
  }
  
  transition: opacity 0.2s ease;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
`;

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

  return (
    <LogoContainer
      className={className}
      onClick={handleClick}
      data-testid={dataTestId}
      role="button"
      aria-label="Перейти на главную"
    >
      <LogoImage src="/logo.svg" alt="просто" />
    </LogoContainer>
  );
};

export default AppLogo;

import React from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import AppHeader from '../../Layout/AppHeader';
import type { TabId } from '../../Layout/AppNavigation/AppNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  background: #F9F8F5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 129px; // 48px верх + 49px хедер + 32px отступ
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Маппинг путей на активные табы
const pathToTabMap: Record<string, TabId> = {
  '/services': 'services',
  '/orders': 'orders',
  '/analytics': 'analytics',
  '/schedule': 'schedule',
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Определяем активный таб по текущему пути
  const activeTab = pathToTabMap[location.pathname] || 'services';
  
  return (
    <LayoutContainer>
      <AppHeader activeTab={activeTab} />
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default AppLayout;

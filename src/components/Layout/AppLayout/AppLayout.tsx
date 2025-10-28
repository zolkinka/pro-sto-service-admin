import React from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from '../../Layout/AppHeader';
import type { TabId } from '../../Layout/AppNavigation/AppNavigation';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

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
    <div className="app-layout">
      <AppHeader activeTab={activeTab} />
      <main className="app-layout__content">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;

import React from 'react';
import AppHeader from '../../Layout/AppHeader';
import { useActiveTab } from '../../../hooks';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Используем хук для определения активного таба по текущему пути
  const activeTab = useActiveTab();
  
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

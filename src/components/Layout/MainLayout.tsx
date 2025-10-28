import { useState } from 'react';
import classNames from 'classnames';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarIsOpen(!sidebarIsOpen);
  };

  const closeSidebar = () => {
    setSidebarIsOpen(false);
  };

  return (
    <div className="main-layout">
      <Header />
      
      <div className="main-layout__container">
        <Sidebar isOpen={sidebarIsOpen} />
        
        <main className="main-layout__content">
          {children}
        </main>
      </div>

      <button className="main-layout__menu-toggle" onClick={toggleSidebar}>
        {sidebarIsOpen ? '✕' : '☰'}
      </button>

      <div className={classNames('main-layout__mobile-overlay', { 'main-layout__mobile-overlay_open': sidebarIsOpen })} onClick={closeSidebar} />
    </div>
  );
};

export default MainLayout;
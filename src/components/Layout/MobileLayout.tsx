import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileHeader } from '../../mobile-components/MobileHeader';
import { MobileMenu } from '../../mobile-components/MobileMenu';
import './MobileLayout.css';

export const MobileLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNotificationClick = () => {
    // TODO: Добавить обработку уведомлений
    console.log('Notifications clicked');
  };

  // Страницы, которые используют свой собственный хедер
  const pagesWithCustomHeader = ['/orders'];
  const shouldShowDefaultHeader = !pagesWithCustomHeader.includes(location.pathname);

  return (
    <div className="mobile-layout">
      {shouldShowDefaultHeader && (
        <MobileHeader 
          onMenuClick={handleMenuToggle}
          onNotificationClick={handleNotificationClick}
          isMenuOpen={isMenuOpen}
        />
      )}
      
      <main className="mobile-layout__content">
        <Outlet />
      </main>

      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
      />
    </div>
  );
};

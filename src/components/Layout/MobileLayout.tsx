import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MobileHeader } from '../../mobile-components/MobileHeader';
import { MobileMenu } from '../../mobile-components/MobileMenu';
import { ROUTES } from '../../constants/routes';
import './MobileLayout.css';

export const MobileLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNotificationClick = () => {
    navigate(ROUTES.NOTIFICATIONS);
  };

  // Страницы, которые используют свой собственный хедер
  const pagesWithCustomHeader = ['/orders'];
  const shouldShowDefaultHeader = !pagesWithCustomHeader.includes(location.pathname);
  const hasCustomHeader = pagesWithCustomHeader.includes(location.pathname);

  return (
    <div className="mobile-layout">
      {shouldShowDefaultHeader && (
        <MobileHeader 
          onMenuClick={handleMenuToggle}
          onNotificationClick={handleNotificationClick}
          isMenuOpen={isMenuOpen}
        />
      )}
      
      <main className={`mobile-layout__content ${hasCustomHeader ? 'mobile-layout__content--no-padding' : ''}`}>
        <Outlet context={{ onMenuToggle: handleMenuToggle, isMenuOpen }} />
      </main>

      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
      />
    </div>
  );
};

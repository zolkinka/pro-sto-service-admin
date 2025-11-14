import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import logoMobile from '../../assets/logo-mobile.svg';
import { NotificationIcon, MenuIcon } from '../../components/ui/icons';
import { MobileMenu } from '../MobileMenu';
import { useStores } from '../../hooks';
import './MobileAnalyticsHeader.css';

interface MobileAnalyticsHeaderProps {
  onNotificationClick?: () => void;
}

export const MobileAnalyticsHeader = observer(({ onNotificationClick }: MobileAnalyticsHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { notificationStore } = useStores();

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const hasUnreadNotifications = notificationStore.unreadCount > 0;

  return (
    <>
      <header className="mobile-analytics-header">
        <img 
          src={logoMobile} 
          alt="просто" 
          className="mobile-analytics-header__logo" 
        />
        
        <div className="mobile-analytics-header__buttons">
          <button 
            className="mobile-analytics-header__button" 
            onClick={handleNotificationClick}
            aria-label="Уведомления"
          >
            <NotificationIcon />
            {hasUnreadNotifications && (
              <span className="mobile-analytics-header__notification-dot" />
            )}
          </button>
          
          <button 
            className="mobile-analytics-header__button" 
            onClick={handleMenuToggle}
            aria-label="Меню"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
});

import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppLogo from '../../ui/AppLogo/AppLogo';
import AppNavigation from '../AppNavigation/AppNavigation';
import AppHeaderMenu from '../AppHeaderMenu/AppHeaderMenu';
import NotificationDropdown from '../NotificationDropdown';
import { NotificationIcon } from '../../ui/icons';
import { NewBookingBanner } from '@/components/NewBookingBanner';
import { useStores } from '../../../hooks/useStores';
import type { TabId } from '../AppNavigation/AppNavigation';
import './AppHeader.css';

interface AppHeaderProps {
  activeTab?: TabId;
  pendingBookingsCount?: number;
  onPendingBookingsClick?: () => void;
}

const AppHeader = observer(({ 
  activeTab = 'services', 
  pendingBookingsCount = 0, 
  onPendingBookingsClick 
}: AppHeaderProps) => {
  const { notificationStore } = useStores();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Получаем количество непрочитанных при монтировании
  useEffect(() => {
    notificationStore.getUnreadCount();
    notificationStore.startPolling();

    return () => {
      notificationStore.stopPolling();
    };
  }, [notificationStore]);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  const isOrdersPage = location.pathname.includes('/orders');
  const showBanner = !isOrdersPage && pendingBookingsCount > 0 && onPendingBookingsClick;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <AppLogo />
        <AppNavigation activeTab={activeTab} />
        <div className="app-header__actions">
          {showBanner ? (
            <NewBookingBanner
              count={pendingBookingsCount}
              onClick={onPendingBookingsClick}
            />
          ) : (
            <>
              <AppHeaderMenu />
              <div className="app-header__notification-wrapper">
                <button 
                  className="app-header__icon-button"
                  onClick={handleToggleDropdown}
                >
                  <NotificationIcon />
                  {notificationStore.unreadCount > 0 && (
                    <span className="app-header__badge">
                      {notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown 
                  isOpen={isDropdownOpen} 
                  onClose={handleCloseDropdown}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

AppHeader.displayName = 'AppHeader';

export default AppHeader;

import { useLocation } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';
import type { TabId } from './AppNavigation';
import { NewBookingBanner } from '@/components/NewBookingBanner';
import './Header.css';

interface HeaderProps {
  pendingBookingsCount?: number;
  onPendingBookingsClick?: () => void;
}

const Header = ({ pendingBookingsCount = 0, onPendingBookingsClick }: HeaderProps) => {
  const location = useLocation();

  const getActiveTab = (): TabId => {
    if (location.pathname.includes('/services')) return 'services';
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/analytics')) return 'analytics';
    if (location.pathname.includes('/schedule')) return 'schedule';
    return 'services';
  };

  const isOrdersPage = location.pathname.includes('/orders');
  const showBanner = !isOrdersPage && pendingBookingsCount > 0 && onPendingBookingsClick;

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__logo">Pro-STO Admin</div>
        
        <AppNavigation activeTab={getActiveTab()} />

        <div className="header__user-section">
          {showBanner ? (
            <NewBookingBanner
              count={pendingBookingsCount}
              onClick={onPendingBookingsClick}
            />
          ) : (
            <div className="header__user-avatar">A</div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
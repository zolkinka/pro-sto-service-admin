import { useLocation } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';
import type { TabId } from './AppNavigation';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const getActiveTab = (): TabId => {
    if (location.pathname.includes('/services')) return 'services';
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/analytics')) return 'analytics';
    if (location.pathname.includes('/schedule')) return 'schedule';
    return 'services';
  };

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__logo">Pro-STO Admin</div>
        
        <AppNavigation activeTab={getActiveTab()} />

        <div className="header__user-section">
          <div className="header__user-avatar">A</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
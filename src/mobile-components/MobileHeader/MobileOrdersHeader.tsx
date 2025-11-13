import { NotificationIcon, MenuIcon, CloseIcon } from '../../components/ui/icons';
import logoMobile from '../../assets/logo-mobile.svg';
import './MobileOrdersHeader.css';

interface MobileOrdersHeaderProps {
  onMenuClick: () => void;
  onNotificationClick?: () => void;
  isMenuOpen?: boolean;
}

export const MobileOrdersHeader = ({ 
  onMenuClick, 
  onNotificationClick, 
  isMenuOpen = false 
}: MobileOrdersHeaderProps) => {
  return (
    <header className="mobile-orders-header">
      <img 
        src={logoMobile} 
        alt="просто" 
        className="mobile-orders-header__logo" 
      />
      
      <div className="mobile-orders-header__buttons">
        {!isMenuOpen && (
          <button 
            className="mobile-orders-header__button" 
            onClick={onNotificationClick}
            aria-label="Уведомления"
          >
            <NotificationIcon />
          </button>
        )}
        
        <button 
          className="mobile-orders-header__button" 
          onClick={onMenuClick}
          aria-label={isMenuOpen ? "Закрыть меню" : "Меню"}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
};

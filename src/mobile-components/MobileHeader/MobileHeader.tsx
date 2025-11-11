import logoMobile from '../../assets/logo-mobile.svg';
import { NotificationIcon, MenuIcon, CloseIcon } from '../../components/ui/icons';
import './MobileHeader.css';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onNotificationClick?: () => void;
  isMenuOpen?: boolean;
}

export const MobileHeader = ({ onMenuClick, onNotificationClick, isMenuOpen = false }: MobileHeaderProps) => {
  return (
    <header className="mobile-header">
      <img 
        src={logoMobile} 
        alt="просто" 
        className="mobile-header__logo" 
      />
      
      <div className="mobile-header__buttons">
        {!isMenuOpen && (
          <button 
            className="mobile-header__button" 
            onClick={onNotificationClick}
            aria-label="Уведомления"
          >
            <NotificationIcon />
          </button>
        )}
        
        <button 
          className="mobile-header__button" 
          onClick={onMenuClick}
          aria-label={isMenuOpen ? "Закрыть меню" : "Меню"}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
};

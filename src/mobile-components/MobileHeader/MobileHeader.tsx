import { useNavigate } from 'react-router-dom';
import logoMobile from '../../assets/logo-mobile.svg';
import { NotificationIcon, MenuIcon, CloseIcon } from '../../components/ui/icons';
import { ROUTES } from '../../constants/routes';
import './MobileHeader.css';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onNotificationClick?: () => void;
  isMenuOpen?: boolean;
}

export const MobileHeader = ({ onMenuClick, onNotificationClick, isMenuOpen = false }: MobileHeaderProps) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate(ROUTES.ORDERS);
  };

  return (
    <header className="mobile-header">
      <img 
        src={logoMobile} 
        alt="просто" 
        className="mobile-header__logo" 
        onClick={handleLogoClick}
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

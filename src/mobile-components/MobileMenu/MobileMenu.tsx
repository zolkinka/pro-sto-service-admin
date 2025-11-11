import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Divider } from '../../components/ui/Divider';
import { 
  UserIcon, 
  NotificationIcon, 
  SupportIcon, 
  LogoutIcon 
} from '../../components/ui/icons';
import { useStores } from '../../hooks';
import { ROUTES } from '../../constants/routes';
import './MobileMenu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = observer(({ isOpen, onClose }: MobileMenuProps) => {
  const navigate = useNavigate();
  const { authStore } = useStores();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    authStore.logout();
    onClose();
  };

  const handleNotifications = () => {
    navigate(ROUTES.SETTINGS);
    onClose();
  };

  // Форматирование телефона для отображения
  const formatPhone = (phone: string) => {
    // Пример: +79001234567 -> +7 (900) 123-45-67
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
      return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };

  return (
    <>
      <div 
        className={`mobile-menu-overlay ${isOpen ? 'mobile-menu-overlay--visible' : ''}`}
        onClick={onClose}
      />
      
      <div className={`mobile-menu ${isOpen ? 'mobile-menu--open' : ''}`}>
        <div className="mobile-menu__content">
          <div className="mobile-menu__user">
            <div className="mobile-menu__user-icon">
              <UserIcon />
            </div>
            <span className="mobile-menu__user-phone">
              {formatPhone(authStore.user?.phone || '')}
            </span>
          </div>

          <nav className="mobile-menu__nav">
            <button 
              className="mobile-menu__item" 
              onClick={() => handleNavigate(ROUTES.SERVICES)}
            >
              Услуги
            </button>
            
            <button 
              className="mobile-menu__item" 
              onClick={() => handleNavigate(ROUTES.ORDERS)}
            >
              Заказы
            </button>
            
            <button 
              className="mobile-menu__item" 
              onClick={() => handleNavigate(ROUTES.ANALYTICS)}
            >
              Аналитика
            </button>
            
            <button 
              className="mobile-menu__item" 
              onClick={() => handleNavigate(ROUTES.SCHEDULE)}
            >
              Время работы
            </button>
          </nav>

          <div className="mobile-menu__divider">
            <Divider />
          </div>

          <div className="mobile-menu__actions">
            <button 
              className="mobile-menu__action" 
              onClick={handleNotifications}
            >
              <NotificationIcon />
              <span>Уведомления</span>
            </button>
            
            <button 
              className="mobile-menu__action" 
              onClick={() => {
                // TODO: Добавить страницу поддержки
                onClose();
              }}
            >
              <SupportIcon />
              <span>Поддержка</span>
            </button>
            
            <button 
              className="mobile-menu__action" 
              onClick={handleLogout}
            >
              <LogoutIcon />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

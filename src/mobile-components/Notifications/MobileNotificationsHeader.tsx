import { observer } from 'mobx-react-lite';
import logoMobile from '../../assets/logo-mobile.svg';
import { NotificationIcon, MenuIcon } from '../../components/ui/icons';
import { notificationStore } from '../../stores/NotificationStore';
import './MobileNotificationsHeader.css';

interface MobileNotificationsHeaderProps {
  onMenuClick: () => void;
}

export const MobileNotificationsHeader = observer(({ onMenuClick }: MobileNotificationsHeaderProps) => {
  const { unreadCount } = notificationStore;

  return (
    <header className="mobile-notifications-header">
      <img 
        src={logoMobile} 
        alt="просто" 
        className="mobile-notifications-header__logo" 
      />
      
      <div className="mobile-notifications-header__buttons">
        <button 
          className="mobile-notifications-header__button" 
          aria-label="Уведомления"
          disabled
        >
          <NotificationIcon />
          {unreadCount > 0 && (
            <span className="mobile-notifications-header__badge">{unreadCount}</span>
          )}
        </button>
        
        <button 
          className="mobile-notifications-header__button" 
          onClick={onMenuClick}
          aria-label="Меню"
        >
          <MenuIcon />
        </button>
      </div>
    </header>
  );
});

MobileNotificationsHeader.displayName = 'MobileNotificationsHeader';

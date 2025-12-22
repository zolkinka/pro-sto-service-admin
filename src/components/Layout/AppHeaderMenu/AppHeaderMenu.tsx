import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import AppBaseDropdown from '../../ui/AppBaseDropdown/AppBaseDropdown';
import { SettingsIcon, UserIcon, LogoutIcon } from '../../ui/icons';
import { useStores } from '../../../hooks';
import { setDebugMode } from '../../../hooks/useDebugMode';
import { toastStore } from '../../../stores/ToastStore';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import './AppHeaderMenu.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

const AppHeaderMenu: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authStore } = useStores();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Для активации дебаг-режима: 10 кликов на иконку профиля на странице настроек
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const CLICK_TIMEOUT = 3000; // 3 секунды между кликами
  const REQUIRED_CLICKS = 10;

  const menuItems: MenuItem[] = [
    {
      id: 'settings',
      label: 'Настройки',
      icon: <SettingsIcon />,
      action: () => navigate('/settings'),
    },
    {
      id: 'logout',
      label: 'Выход',
      icon: <LogoutIcon />,
      action: () => setShowLogoutConfirm(true),
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    item.action();
    setIsOpen(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    authStore.logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    
    // Активация дебаг-режима на странице настроек
    const isSettingsPage = location.pathname === '/settings';
    if (isSettingsPage) {
      const now = Date.now();
      
      // Сброс счетчика, если прошло больше времени чем CLICK_TIMEOUT
      if (now - lastClickTimeRef.current > CLICK_TIMEOUT) {
        clickCountRef.current = 0;
      }
      
      clickCountRef.current += 1;
      lastClickTimeRef.current = now;
      
      if (clickCountRef.current === REQUIRED_CLICKS) {
        setDebugMode(true);
        toastStore.showSuccess('Дебаг-режим активирован! 🐛');
        clickCountRef.current = 0;
      }
    }
  };
  
  // Сброс счетчика при уходе со страницы настроек
  useEffect(() => {
    if (location.pathname !== '/settings') {
      clickCountRef.current = 0;
    }
  }, [location.pathname]);

  return (
    <>
      <AppBaseDropdown
        opened={isOpen}
        onClose={() => setIsOpen(false)}
        dropdownWidth="197px"
        xDirection="left"
        yDirection="bottom"
        toggle={
          <button className="app-header-menu__profile-button" onClick={toggleDropdown} aria-label="Открыть меню профиля">
            <UserIcon />
          </button>
        }
        dropdown={
          <div className="app-header-menu-dropdown">
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <button className="app-header-menu__item" onClick={() => handleItemClick(item)}>
                  <div className="app-header-menu__icon">{item.icon}</div>
                  <span className="app-header-menu__label">{item.label}</span>
                </button>
                {index < menuItems.length - 1 && <div className="app-header-menu__divider" />}
              </React.Fragment>
            ))}
          </div>
        }
      />

      <ConfirmLogoutModal
        isOpen={showLogoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </>
  );
});

AppHeaderMenu.displayName = 'AppHeaderMenu';

export default AppHeaderMenu;

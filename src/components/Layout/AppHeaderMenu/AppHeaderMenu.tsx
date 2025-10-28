import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBaseDropdown from '../../ui/AppBaseDropdown/AppBaseDropdown';
import { TariffsIcon, SupportIcon, SettingsIcon, UserIcon } from '../../ui/icons';
import './AppHeaderMenu.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

const AppHeaderMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'tariffs',
      label: 'Тарифы',
      icon: <TariffsIcon />,
      action: () => navigate('/tariffs'),
    },
    {
      id: 'support',
      label: 'Поддержка',
      icon: <SupportIcon />,
      action: () => window.open('https://support.url', '_blank'),
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: <SettingsIcon />,
      action: () => navigate('/settings'),
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    item.action();
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <AppBaseDropdown
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      dropdownWidth="197px"
      xDirection="right"
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
  );
};

AppHeaderMenu.displayName = 'AppHeaderMenu';

export default AppHeaderMenu;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
        <ProfileButton onClick={toggleDropdown} aria-label="Открыть меню профиля">
          <UserIcon />
        </ProfileButton>
      }
      dropdown={
        <MenuContainer className="app-header-menu-dropdown">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <MenuItem onClick={() => handleItemClick(item)}>
                <MenuIcon>{item.icon}</MenuIcon>
                <MenuLabel>{item.label}</MenuLabel>
              </MenuItem>
              {index < menuItems.length - 1 && <MenuDivider />}
            </React.Fragment>
          ))}
        </MenuContainer>
      }
    />
  );
};

AppHeaderMenu.displayName = 'AppHeaderMenu';

export default AppHeaderMenu;

const ProfileButton = styled.button`
  width: 49px;
  height: 49px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #f4f3f0;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #e8e7e4;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const MenuContainer = styled.div`
  background: #ffffff;
  border-radius: 22px;
  padding: 16px;
  width: 197px;
`;

const MenuItem = styled.button`
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f9f8f5;
  }
`;

const MenuIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const MenuLabel = styled.span`
  font-family: 'Onest', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  color: #302f2d;
  white-space: nowrap;
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #f4f3f0;
  margin: 6px 0;
`;

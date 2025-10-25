import styled from 'styled-components';

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.primary};
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.fixed};
  transform: translateX(${({ isOpen }) => isOpen ? '0' : '-100%'});
  transition: transform ${({ theme }) => theme.transition.normal};

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    position: static;
    transform: none;
    height: calc(100vh - 73px); /* Subtract header height */
  }
`;

const SidebarContent = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  margin-top: 73px; /* Header height offset for mobile */

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    margin-top: 0;
  }
`;

const SidebarTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MenuLink = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  background-color: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[600]};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primary[100]};
    color: ${({ theme }) => theme.colors.primary[700]};
  }
`;

const Placeholder = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar = ({ isOpen = false }: SidebarProps) => {
  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarContent>
        <SidebarTitle>Навигация</SidebarTitle>
        <MenuList>
          <MenuItem>
            <MenuLink className="active">
              📊 Панель управления
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink>
              👥 Пользователи
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink>
              📋 Заказы
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink>
              🏪 Сервисы
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink>
              ⚙️ Настройки
            </MenuLink>
          </MenuItem>
        </MenuList>
        
        <Placeholder>
          Меню будет расширено<br />
          в следующих задачах
        </Placeholder>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export type TabId = 'services' | 'orders' | 'analytics' | 'schedule';

interface Tab {
  id: TabId;
  label: string;
  path: string;
}

interface AppNavigationProps {
  activeTab: TabId;
  onTabChange?: (tab: TabId) => void;
}

const tabs: Tab[] = [
  { id: 'services', label: 'Услуги', path: '/services' },
  { id: 'orders', label: 'Заказы', path: '/orders' },
  { id: 'analytics', label: 'Аналитика', path: '/analytics' },
  { id: 'schedule', label: 'Время работы', path: '/schedule' },
];

const NavigationContainer = styled.nav`
  position: absolute;
  left: 50%;
  top: 8px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
`;

const NavTab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  border-radius: 16px;
  border: 1px solid ${props => props.$active ? '#302F2D' : '#F9F8F5'};
  background: ${props => props.$active ? '#302F2D' : '#F9F8F5'};
  color: ${props => props.$active ? '#FFFFFF' : '#53514F'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$active ? '#302F2D' : '#FFFFFF'};
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const AppNavigation = ({ activeTab, onTabChange }: AppNavigationProps) => {
  const navigate = useNavigate();
  
  const handleTabClick = (tab: Tab) => {
    navigate(tab.path);
    onTabChange?.(tab.id);
  };
  
  return (
    <NavigationContainer>
      {tabs.map((tab) => (
        <NavTab 
          key={tab.id}
          $active={activeTab === tab.id}
          onClick={() => handleTabClick(tab)}
        >
          {tab.label}
        </NavTab>
      ))}
    </NavigationContainer>
  );
};

export default AppNavigation;

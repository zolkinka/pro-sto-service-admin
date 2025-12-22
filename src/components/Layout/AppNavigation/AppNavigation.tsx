import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import './AppNavigation.css';

export type TabId = 'services' | 'orders' | 'analytics' | 'schedule';

interface Tab {
  id: TabId;
  label: string;
  path: string;
}

interface AppNavigationProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

const tabs: Tab[] = [
  { id: 'services', label: 'Услуги', path: '/services' },
  { id: 'orders', label: 'Заказы', path: '/orders' },
  { id: 'analytics', label: 'Аналитика', path: '/analytics' },
  { id: 'schedule', label: 'Время работы', path: '/schedule' },
];

const AppNavigation = ({ activeTab, onTabChange }: AppNavigationProps) => {
  const navigate = useNavigate();
  
  const handleTabClick = (tab: Tab) => {
    navigate(tab.path);
    onTabChange?.(tab.id);
  };
  
  return (
    <nav className="app-navigation">
      {tabs.map((tab) => {
        const tabClassName = classNames('app-navigation__tab', {
          'app-navigation__tab_active': activeTab === tab.id,
        });

        return (
          <button
            key={tab.id}
            className={tabClassName}
            onClick={() => handleTabClick(tab)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default AppNavigation;

import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar = ({ isOpen = false }: SidebarProps) => {
  const location = useLocation();

  const sidebarClassName = classNames('sidebar', {
    'sidebar_open': isOpen,
  });
  
  return (
    <aside className={sidebarClassName}>
      <div className="sidebar__content">
        <h3 className="sidebar__title">Навигация</h3>
        <ul className="sidebar__menu-list">
          <li className="sidebar__menu-item">
            <Link 
              to={ROUTES.DASHBOARD}
              className={classNames('sidebar__menu-link', {
                'active': location.pathname === ROUTES.DASHBOARD
              })}
            >
              📊 Панель управления
            </Link>
          </li>
          <li className="sidebar__menu-item">
            <Link to="#" className="sidebar__menu-link">
              👥 Пользователи
            </Link>
          </li>
          <li className="sidebar__menu-item">
            <Link to="#" className="sidebar__menu-link">
              📋 Заказы
            </Link>
          </li>
          <li className="sidebar__menu-item">
            <Link to="#" className="sidebar__menu-link">
              🏪 Сервисы
            </Link>
          </li>
          <li className="sidebar__menu-item">
            <Link to="#" className="sidebar__menu-link">
              ⚙️ Настройки
            </Link>
          </li>
        </ul>
        
        <div className="sidebar__placeholder">
          Меню будет расширено<br />
          в следующих задачах
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

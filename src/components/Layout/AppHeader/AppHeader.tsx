import { observer } from 'mobx-react-lite';
import AppLogo from '../../ui/AppLogo/AppLogo';
import AppNavigation from '../AppNavigation/AppNavigation';
import AppHeaderMenu from '../AppHeaderMenu/AppHeaderMenu';
import { NotificationIcon } from '../../ui/icons';
import type { TabId } from '../AppNavigation/AppNavigation';
import './AppHeader.css';

interface AppHeaderProps {
  activeTab?: TabId;
}

const AppHeader = observer(({ activeTab = 'services' }: AppHeaderProps) => {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <AppLogo />
        <AppNavigation activeTab={activeTab} />
        <div className="app-header__actions">
          <AppHeaderMenu />
          <button className="app-header__icon-button">
            <NotificationIcon />
          </button>
        </div>
      </div>
    </header>
  );
});

AppHeader.displayName = 'AppHeader';

export default AppHeader;

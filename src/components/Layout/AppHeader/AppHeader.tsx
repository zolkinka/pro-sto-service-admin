import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import AppLogo from '../../ui/AppLogo/AppLogo';
import AppNavigation from '../AppNavigation/AppNavigation';
import AppHeaderMenu from '../AppHeaderMenu/AppHeaderMenu';
import { NotificationIcon } from '../../ui/icons';
import type { TabId } from '../AppNavigation/AppNavigation';

interface AppHeaderProps {
  activeTab?: TabId;
}

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #F9F8F5;
  padding: 48px 0 32px;
`;

const HeaderInner = styled.div`
  max-width: 1282px;
  height: 49px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 11px;
  align-items: center;
`;

const IconButton = styled.button`
  width: 49px;
  height: 49px;
  background: #FFFFFF;
  border: 1px solid #F4F3F0;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #302F2D;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const AppHeader = observer(({ activeTab = 'services' }: AppHeaderProps) => {
  return (
    <HeaderContainer>
      <HeaderInner>
        <AppLogo />
        <AppNavigation activeTab={activeTab} />
        <HeaderActions>
          <AppHeaderMenu />
          <IconButton>
            <NotificationIcon />
          </IconButton>
        </HeaderActions>
      </HeaderInner>
    </HeaderContainer>
  );
});

AppHeader.displayName = 'AppHeader';

export default AppHeader;

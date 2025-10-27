import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';
import type { TabId } from './AppNavigation';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[600]};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary[600]};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Header = () => {
  const location = useLocation();

  const getActiveTab = (): TabId => {
    if (location.pathname.includes('/services')) return 'services';
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/analytics')) return 'analytics';
    if (location.pathname.includes('/schedule')) return 'schedule';
    return 'services';
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>Pro-STO Admin</Logo>
        
        <AppNavigation activeTab={getActiveTab()} />

        <UserSection>
          <UserAvatar>A</UserAvatar>
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
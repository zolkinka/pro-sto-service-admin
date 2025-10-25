import { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
`;

const ContentArea = styled.main`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  overflow-y: auto;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    margin-left: 0;
  }
`;

const MobileOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modalBackdrop};
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: all ${({ theme }) => theme.transition.fast};

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`;

const MenuToggle = styled.button`
  display: block;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: ${({ theme }) => theme.zIndex.modal};
  background-color: ${({ theme }) => theme.colors.primary[600]};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSize.lg};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${({ theme }) => theme.transition.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[700]};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarIsOpen(!sidebarIsOpen);
  };

  const closeSidebar = () => {
    setSidebarIsOpen(false);
  };

  return (
    <LayoutContainer>
      <Header />
      
      <MainContainer>
        <Sidebar isOpen={sidebarIsOpen} />
        
        <ContentArea>
          {children}
        </ContentArea>
      </MainContainer>

      <MenuToggle onClick={toggleSidebar}>
        {sidebarIsOpen ? '✕' : '☰'}
      </MenuToggle>

      <MobileOverlay isOpen={sidebarIsOpen} onClick={closeSidebar} />
    </LayoutContainer>
  );
};

export default MainLayout;
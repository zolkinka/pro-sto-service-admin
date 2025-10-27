import React from 'react';
import styled from 'styled-components';
import AppHeader from '../../Layout/AppHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  background: #F9F8F5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 129px; // 48px верх + 49px хедер + 32px отступ
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <AppHeader />
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default AppLayout;

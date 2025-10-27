import styled from 'styled-components';

export const PageContainer = styled.div`
  background: #f9f8f5;
  min-height: 100vh;
  padding: 129px 0 40px; // отступ сверху для fixed header
  display: flex;
  justify-content: center;
`;

export const MainContainer = styled.div`
  width: 1064px;
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0px 1px 2px 0px rgba(30, 27, 21, 0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Content = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <Title>Панель управления</Title>
      <Content>
        <p>Добро пожаловать в админскую панель сервиса бронирования автоуслуг!</p>
        <p>Здесь будет основной функционал администрирования.</p>
        <p style={{ marginTop: '16px' }}>Для просмотра компонентов используйте Storybook: <code>npm run storybook</code></p>
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard;
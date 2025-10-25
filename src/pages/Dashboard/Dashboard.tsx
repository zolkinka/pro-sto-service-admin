import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppButton } from '@/components/ui/AppButton';

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
        
        <div style={{ marginTop: '24px' }}>
          <p>Демонстрация компонентов UI:</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
            <Link to={ROUTES.BUTTON_SHOWCASE}>
              <AppButton variant="primary">
                Посмотреть кнопки AppButton
              </AppButton>
            </Link>
          </div>
        </div>
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard;
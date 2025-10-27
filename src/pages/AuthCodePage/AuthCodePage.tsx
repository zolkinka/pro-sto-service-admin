import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { authStore } from '@/stores/AuthStore';
import { AppCodeInput } from '@/components/ui/AppCodeInput';
import { AppButton } from '@/components/ui/AppButton';
import AppLogo from '@/components/ui/AppLogo';
import { ROUTES } from '@/constants/routes';

const PageContainer = styled.div`
  background: #F9F8F5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const LogoWrapper = styled.div`
  margin-top: 100px;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.onest};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  font-size: 28px;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.gray[900]};
  margin-top: 28px;
  text-align: center;
`;

const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[25]};
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0px 2px 4px 0px rgba(30, 27, 21, 0.05);
  width: 412px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 55px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: calc(100% - 32px);
    padding: 32px 24px;
  }
`;

const ResendButton = styled.button<{ $canResend: boolean }>`
  background: transparent;
  border: none;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.fontWeight.normal};
  color: ${({ theme, $canResend }) => 
    $canResend ? theme.colors.primary[500] : theme.colors.gray[500]};
  cursor: ${({ $canResend }) => ($canResend ? 'pointer' : 'not-allowed')};
  text-align: center;
  padding: 0;
  line-height: 1.2;
  
  &:hover {
    opacity: ${({ $canResend }) => ($canResend ? '0.8' : '1')};
  }
  
  transition: opacity 0.2s ease;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  
  button {
    width: 100%;
  }
`;

interface LocationState {
  phone?: string;
}

const AuthCodePage: React.FC = observer(() => {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as LocationState;
  const phone = state?.phone;

  // Если нет номера телефона в state - редирект на страницу ввода номера
  useEffect(() => {
    if (!phone) {
      navigate(ROUTES.AUTH_PHONE, { replace: true });
    }
  }, [phone, navigate]);

  // Таймер для "Отправить повторно"
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleCodeComplete = async (completedCode: string) => {
    if (!phone) return;

    try {
      await authStore.verifyCode(phone, completedCode);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      // Ошибка обрабатывается в authStore и показывается через toast
      console.error('Error verifying code:', error);
      // Очищаем код при ошибке
      setCode('');
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleResend = async () => {
    if (!canResend || !phone) return;

    try {
      await authStore.sendCode(phone);
      setTimer(60);
      setCanResend(false);
      setCode('');
    } catch (error) {
      console.error('Error resending code:', error);
    }
  };

  const handleSubmit = async () => {
    if (code.length !== 4 || !phone) return;
    await handleCodeComplete(code);
  };

  if (!phone) {
    return null;
  }

  return (
    <PageContainer>
      <LogoWrapper>
        <AppLogo />
      </LogoWrapper>

      <Title>Авторизация</Title>

      <FormCard>
        <AppCodeInput
          label="Введите код из СМС"
          length={4}
          onChange={handleCodeChange}
          onComplete={handleCodeComplete}
          disabled={authStore.isLoading}
          autoFocus
        />

        <ResendButton
          onClick={handleResend}
          disabled={!canResend || authStore.isLoading}
          $canResend={canResend && !authStore.isLoading}
        >
          {canResend 
            ? 'Отправить повторно' 
            : `Отправить повторно через ${timer}с`
          }
        </ResendButton>

        <ButtonWrapper>
          <AppButton
            variant="primary"
            size="L"
            onClick={handleSubmit}
            disabled={code.length !== 4 || authStore.isLoading}
            loading={authStore.isLoading}
          >
            Далее
          </AppButton>
        </ButtonWrapper>
      </FormCard>
    </PageContainer>
  );
});

AuthCodePage.displayName = 'AuthCodePage';

export default AuthCodePage;

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { authStore } from '@/stores/AuthStore';
import AppPhoneInput from '@/components/ui/AppPhoneInput';
import { AppButton } from '@/components/ui/AppButton';
import AppLogo from '@/components/ui/AppLogo';
import { ROUTES } from '@/constants/routes';
import { extractPhoneDigits } from '@/components/ui/AppPhoneInput/utils/phoneHelpers';

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

const ButtonWrapper = styled.div`
  width: 100%;
  
  button {
    width: 100%;
  }
`;

const AuthPhonePage: React.FC = observer(() => {
  const [phone, setPhone] = useState('+7');
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const handlePhoneChange = (value: string) => {
    // value приходит без +7, добавляем обратно для маски
    setPhone(`+7${value}`);
  };

  const handlePhoneValidate = (valid: boolean, cleanPhone: string) => {
    setIsValid(valid && cleanPhone.length === 10);
  };

  const handleSubmit = async () => {
    if (!isValid || authStore.isLoading) return;

    try {
      const cleanPhone = extractPhoneDigits(phone);
      const formattedPhone = `+7${cleanPhone}`;
      
      await authStore.sendCode(formattedPhone);
      
      // Переход на страницу ввода кода
      navigate(ROUTES.AUTH_CODE, { state: { phone: formattedPhone } });
    } catch (error) {
      // Ошибка обрабатывается в authStore и показывается через toast
      console.error('Error sending code:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !authStore.isLoading) {
      handleSubmit();
    }
  };

  return (
    <PageContainer>
      <LogoWrapper>
        <AppLogo />
      </LogoWrapper>

      <Title>Авторизация</Title>

      <FormCard>
        <div onKeyPress={handleKeyPress}>
          <AppPhoneInput
            label="Номер телефона"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={handlePhoneChange}
            onValidate={handlePhoneValidate}
            disabled={authStore.isLoading}
            autoFocus
          />
        </div>

        <ButtonWrapper>
          <AppButton
            variant="primary"
            size="L"
            onClick={handleSubmit}
            disabled={!isValid || authStore.isLoading}
            loading={authStore.isLoading}
          >
            Далее
          </AppButton>
        </ButtonWrapper>
      </FormCard>
    </PageContainer>
  );
});

AuthPhonePage.displayName = 'AuthPhonePage';

export default AuthPhonePage;

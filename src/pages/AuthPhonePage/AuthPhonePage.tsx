import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/stores/AuthStore';
import AppPhoneInput from '@/components/ui/AppPhoneInput';
import { AppButton } from '@/components/ui/AppButton';
import AppLogo from '@/components/ui/AppLogo';
import { ROUTES } from '@/constants/routes';
import { extractPhoneDigits } from '@/components/ui/AppPhoneInput/utils/phoneHelpers';
import './AuthPhonePage.css';

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
    <div className="auth-phone">
      <div className="auth-phone__logo">
        <AppLogo />
      </div>

      <h1 className="auth-phone__title">Авторизация</h1>

      <div className="auth-phone__form">
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

        <div className="auth-phone__button">
          <AppButton
            variant="primary"
            size="L"
            onClick={handleSubmit}
            disabled={!isValid || authStore.isLoading}
            loading={authStore.isLoading}
          >
            Далее
          </AppButton>
        </div>
      </div>
    </div>
  );
});

AuthPhonePage.displayName = 'AuthPhonePage';

export default AuthPhonePage;

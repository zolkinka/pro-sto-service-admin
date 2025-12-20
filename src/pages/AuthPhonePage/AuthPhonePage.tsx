import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/stores/AuthStore';
import AppPhoneInput from '@/components/ui/AppPhoneInput';
import type { AppInputRef } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import AppLogo from '@/components/ui/AppLogo';
import { ROUTES } from '@/constants/routes';
import { extractPhoneDigits } from '@/components/ui/AppPhoneInput/utils/phoneHelpers';
import './AuthPhonePage.css';

const AuthPhonePage: React.FC = observer(() => {
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();
  const phoneInputRef = useRef<AppInputRef>(null);

  const handlePhoneChange = () => {
    // Телефон берётся напрямую из ref, параметр value не нужен
  };

  const handlePhoneValidate = (valid: boolean, cleanPhone: string) => {
    setIsValid(valid && cleanPhone.length === 10);
  };

  const handleSubmit = async () => {
    if (!isValid || authStore.isLoading) return;

    try {
      // Получаем значение напрямую из input (с маской)
      const inputValue = phoneInputRef.current?.value || '';
      const cleanPhone = extractPhoneDigits(inputValue);
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
    <div className="auth-phone" data-testid="auth-phone-page">
      <div className="auth-phone__logo">
        <AppLogo />
      </div>

      <h1 className="auth-phone__title">Авторизация</h1>

      <div className="auth-phone__form">
        <div onKeyPress={handleKeyPress}>
          <AppPhoneInput
            ref={phoneInputRef}
            label="Номер телефона"
            placeholder="+7 (___) ___-__-__"
            onChange={handlePhoneChange}
            onValidate={handlePhoneValidate}
            disabled={authStore.isLoading}
            autoFocus
            data-testid="phone-input"
          />
        </div>

        <div className="auth-phone__button">
          <AppButton
            variant="primary"
            size="L"
            onClick={handleSubmit}
            disabled={!isValid || authStore.isLoading}
            loading={authStore.isLoading}
            data-testid="submit-phone-button"
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

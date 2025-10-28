import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { authStore } from '@/stores/AuthStore';
import { AppCodeInput } from '@/components/ui/AppCodeInput';
import { AppButton } from '@/components/ui/AppButton';
import AppLogo from '@/components/ui/AppLogo';
import { ROUTES } from '@/constants/routes';
import './AuthCodePage.css';

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

  const canResendActive = canResend && !authStore.isLoading;

  return (
    <div className="auth-code">
      <div className="auth-code__logo">
        <AppLogo />
      </div>

      <h1 className="auth-code__title">Авторизация</h1>

      <div className="auth-code__form">
        <AppCodeInput
          label="Введите код из СМС"
          length={4}
          onChange={handleCodeChange}
          onComplete={handleCodeComplete}
          disabled={authStore.isLoading}
          autoFocus
        />

        <button
          className={`auth-code__resend ${canResendActive ? 'auth-code__resend_active' : 'auth-code__resend_disabled'}`}
          onClick={handleResend}
          disabled={!canResend || authStore.isLoading}
        >
          {canResend 
            ? 'Отправить повторно' 
            : `Отправить повторно через ${timer}с`
          }
        </button>

        <div className="auth-code__button">
          <AppButton
            variant="primary"
            size="L"
            onClick={handleSubmit}
            disabled={code.length !== 4 || authStore.isLoading}
            loading={authStore.isLoading}
          >
            Далее
          </AppButton>
        </div>
      </div>
    </div>
  );
});

AuthCodePage.displayName = 'AuthCodePage';

export default AuthCodePage;

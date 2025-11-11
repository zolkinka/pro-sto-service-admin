import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { authStore } from '@/stores/AuthStore';
import { MobileCodeInput, MobileButton } from '@/mobile-components';
import AppLogo from '@/components/ui/AppLogo';
import { ROUTES } from '@/constants/routes';
import './MobileAuthCodePage.css';

interface LocationState {
  phone?: string;
}

const MobileAuthCodePage: React.FC = observer(() => {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
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

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Сбрасываем ошибку при изменении
    if (error) setError('');
  };

  const handleCodeComplete = async (completedCode: string) => {
    if (!phone) return;

    try {
      await authStore.verifyCode(phone, completedCode);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      // Ошибка обрабатывается в authStore и показывается через toast
      console.error('Error verifying code:', err);
      setError('Неверный код');
      // Очищаем код при ошибке
      setCode('');
    }
  };

  const handleResend = async () => {
    if (!canResend || !phone) return;

    try {
      await authStore.sendCode(phone);
      setTimer(60);
      setCanResend(false);
      setCode('');
      setError('');
    } catch (err) {
      console.error('Error resending code:', err);
    }
  };

  const handleSubmit = async () => {
    if (code.length !== 4 || !phone) return;
    await handleCodeComplete(code);
  };

  if (!phone) {
    return null;
  }

  // Форматируем номер телефона для отображения
  const formattedPhone = phone.replace(/^(\+7)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 ($2) $3-$4-$5');

  const handleBack = () => {
    navigate(ROUTES.AUTH_PHONE);
  };

  return (
    <div className="mobile-auth-code">
      <div className="mobile-auth-code__content">
        <button className="mobile-auth-code__back" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Назад</span>
        </button>

        <div className="mobile-auth-code__header">
          <div className="mobile-auth-code__logo">
            <AppLogo />
          </div>
          <h1 className="mobile-auth-code__title">Введите код из смс</h1>
          <p className="mobile-auth-code__subtitle">
            Отправили на номер {formattedPhone}
          </p>
        </div>

        <div className="mobile-auth-code__form">
          <MobileCodeInput
            length={4}
            value={code}
            onChange={handleCodeChange}
            onComplete={handleCodeComplete}
            error={error}
            disabled={authStore.isLoading}
            autoFocus
          />

          <button
            className={`mobile-auth-code__resend ${canResend ? 'mobile-auth-code__resend_active' : ''}`}
            onClick={handleResend}
            disabled={!canResend || authStore.isLoading}
          >
            {canResend 
              ? 'Отправить повторно' 
              : `Отправить повторно через ${timer} секунд`
            }
          </button>

          <MobileButton
            variant="primary"
            onClick={handleSubmit}
            disabled={code.length !== 4 || authStore.isLoading}
            loading={authStore.isLoading}
          >
            Далее
          </MobileButton>
        </div>
      </div>
    </div>
  );
});

MobileAuthCodePage.displayName = 'MobileAuthCodePage';

export default MobileAuthCodePage;

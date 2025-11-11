import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/stores/AuthStore';
import { MobileInput, MobileButton, MobileCheckbox } from '@/mobile-components';
import type { MobileInputRef } from '@/mobile-components';
import AppLogo from '@/components/ui/AppLogo';
import { ROUTES } from '@/constants/routes';
import { extractPhoneDigits } from '@/components/ui/AppPhoneInput/utils/phoneHelpers';
import './MobileAuthPhonePage.css';

const MobileAuthPhonePage: React.FC = observer(() => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const phoneInputRef = useRef<MobileInputRef>(null);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    // Сбрасываем ошибку при изменении
    if (error) setError('');
  };

  const handleValidate = (cleanPhone: string) => {
    // Валидация: должно быть 10 цифр
    if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
      setError('Введите корректный номер телефона');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    const cleanPhone = extractPhoneDigits(phone);
    
    // Проверка заполненности
    if (cleanPhone.length === 0) {
      setError('Введите номер телефона');
      return;
    }

    // Валидация
    if (!handleValidate(cleanPhone)) {
      return;
    }

    if (authStore.isLoading) return;

    try {
      const formattedPhone = `+7${cleanPhone}`;
      await authStore.sendCode(formattedPhone);
      
      // Переход на страницу ввода кода
      navigate(ROUTES.AUTH_CODE, { state: { phone: formattedPhone } });
    } catch (err) {
      // Ошибка обрабатывается в authStore и показывается через toast
      console.error('Error sending code:', err);
    }
  };

  const isValid = extractPhoneDigits(phone).length === 10 && agreed;

  return (
    <div className="mobile-auth-phone">
      <div className="mobile-auth-phone__content">
        <div className="mobile-auth-phone__header">
          <div className="mobile-auth-phone__logo">
            <AppLogo />
          </div>
          <h1 className="mobile-auth-phone__title">Авторизация</h1>
        </div>

        <div className="mobile-auth-phone__form">
          <MobileInput
            ref={phoneInputRef}
            label="Номер телефона"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={handlePhoneChange}
            error={error}
            disabled={authStore.isLoading}
            autoFocus
            mask="+{7} (000) 000-00-00"
            unmask="typed"
            lazy={false}
            placeholderChar="_"
            inputMode="tel"
          />

          <MobileCheckbox
            checked={agreed}
            onChange={setAgreed}
            label={
              <>
                Я согласен на{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mobile-auth-phone__link"
                >
                  обработку персональных данных
                </a>
              </>
            }
          />

          <MobileButton
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || authStore.isLoading}
            loading={authStore.isLoading}
          >
            Далее
          </MobileButton>
        </div>
      </div>
    </div>
  );
});

MobileAuthPhonePage.displayName = 'MobileAuthPhonePage';

export default MobileAuthPhonePage;

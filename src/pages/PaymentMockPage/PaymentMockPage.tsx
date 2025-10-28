import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { bookingGetOne, OpenAPI } from '../../../services/api-client';
import type { DetailedBookingResponseDto } from '../../../services/api-client/types.gen';
import { AppButton } from '@/components/ui/AppButton';
import type { 
  PaymentFormData, 
  PaymentPageStatus,
  PaymentMessage,
  PaymentSuccessData,
  PaymentErrorData,
} from './types';
import {
  formatCardNumber,
  formatExpiryDate,
  formatCVV,
  formatCardholderName,
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  validateCardholderName,
  isFormValid,
  formatAmount,
  generatePaymentUuid,
} from './utils';
import './PaymentMockPage.css';

/**
 * Публичная страница-заглушка платежной системы
 * Встраивается в iframe мобильного приложения
 */
const PaymentMockPage = () => {
  const { bookingUuid } = useParams<{ bookingUuid: string; }>();
  // const { bookingUuid } = use<{ bookingUuid: string; }>();
  
  const [status, setStatus] = useState<PaymentPageStatus>('loading');
  const [booking, setBooking] = useState<DetailedBookingResponseDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PaymentFormData, boolean>>>({});

  /**
   * Загрузка данных о бронировании
   */
  const loadBookingData = useCallback(async () => {
    try {
      setStatus('loading');
      // OpenAPI.TOKEN = accessToken;

      const response = await bookingGetOne({ uuid: bookingUuid! });
      
      // Проверяем статус оплаты
      if (response.payment_status === 'paid') {
        setStatus('already_paid');
        setBooking(response);
        return;
      }
      
      setBooking(response);
      setStatus('ready');
    } catch (error) {
      console.error('Ошибка загрузки бронирования:', error);
      setStatus('not_found');
      setErrorMessage('Бронирование не найдено');
    }
  }, [bookingUuid]);

  /**
   * Загрузка данных о бронировании при монтировании
   */
  useEffect(() => {
    if (!bookingUuid) {
      setStatus('not_found');
      setErrorMessage('UUID бронирования не указан');
      return;
    }

    loadBookingData();
  }, [bookingUuid, loadBookingData]);

  /**
   * Отправка PostMessage родительскому окну
   */
  const sendPostMessage = (message: PaymentMessage) => {
    try {
      window.parent.postMessage(message, '*');
      console.log('PostMessage отправлено:', message);
    } catch (error) {
      console.error('Ошибка отправки PostMessage:', error);
    }
  };

  /**
   * Обработка изменения поля формы
   */
  const handleFieldChange = (field: keyof PaymentFormData, value: string) => {
    let formattedValue = value;

    // Применяем маски
    switch (field) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        break;
      case 'cvv':
        formattedValue = formatCVV(value);
        break;
      case 'cardholderName':
        formattedValue = formatCardholderName(value);
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Сбрасываем ошибку при изменении поля
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Обработка blur поля (для валидации)
   */
  const handleFieldBlur = (field: keyof PaymentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  /**
   * Валидация конкретного поля
   */
  const validateField = (field: keyof PaymentFormData): boolean => {
    const value = formData[field];
    let error = '';

    switch (field) {
      case 'cardNumber':
        if (!validateCardNumber(value)) {
          error = 'Введите корректный номер карты (16 цифр)';
        }
        break;
      case 'expiryDate':
        if (!validateExpiryDate(value)) {
          error = 'Введите корректную дату (MM/YY)';
        }
        break;
      case 'cvv':
        if (!validateCVV(value)) {
          error = 'Введите корректный CVV (3 цифры)';
        }
        break;
      case 'cardholderName':
        if (!validateCardholderName(value)) {
          error = 'Введите имя держателя карты';
        }
        break;
    }

    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
      return false;
    }

    return true;
  };

  /**
   * Имитация процесса оплаты
   */
  const processPayment = async (): Promise<boolean> => {
    // Имитация задержки обработки платежа (2-3 секунды)
    const delay = 2000 + Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Имитация успешной/неуспешной оплаты (90% успех)
    return Math.random() > 0.1;
  };

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Помечаем все поля как touched
    setTouched({
      cardNumber: true,
      expiryDate: true,
      cvv: true,
      cardholderName: true,
    });

    // Валидируем все поля
    const isCardNumberValid = validateField('cardNumber');
    const isExpiryDateValid = validateField('expiryDate');
    const isCVVValid = validateField('cvv');
    const isCardholderNameValid = validateField('cardholderName');

    if (!isCardNumberValid || !isExpiryDateValid || !isCVVValid || !isCardholderNameValid) {
      return;
    }

    // Начинаем обработку платежа
    setStatus('processing');

    try {
      const isSuccess = await processPayment();

      if (isSuccess) {
        // Успешная оплата
        setStatus('success');

        const paymentUuid = generatePaymentUuid();
        
        const successData: PaymentSuccessData = {
          bookingUuid: bookingUuid!,
          paymentUuid,
          amount: booking!.total_cost,
          timestamp: new Date().toISOString(),
        };

        sendPostMessage({
          type: 'PAYMENT_SUCCESS',
          data: successData,
        });

        // TODO: Отправить webhook на сервер
        // await sendWebhookToServer(successData);
      } else {
        // Ошибка оплаты
        setStatus('error');
        setErrorMessage('Не удалось обработать платеж. Попробуйте еще раз.');

        const errorData: PaymentErrorData = {
          bookingUuid: bookingUuid!,
          error: 'Ошибка обработки платежа',
          errorCode: 'PAYMENT_FAILED',
          timestamp: new Date().toISOString(),
        };

        sendPostMessage({
          type: 'PAYMENT_ERROR',
          data: errorData,
        });
      }
    } catch (error) {
      console.error('Ошибка при обработке платежа:', error);
      setStatus('error');
      setErrorMessage('Произошла непредвиденная ошибка');
    }
  };

  /**
   * Повторная попытка оплаты
   */
  const handleRetry = () => {
    setStatus('ready');
    setErrorMessage('');
  };

  /**
   * Проверка, можно ли отправить форму
   */
  const canSubmit = isFormValid(
    formData.cardNumber,
    formData.expiryDate,
    formData.cvv,
    formData.cardholderName
  );

  /**
   * Рендер состояния загрузки
   */
  if (status === 'loading') {
    return (
      <div className="payment-mock-page">
        <div className="payment-mock-page__container">
          <div className="payment-mock-page__loader">
            <div className="payment-mock-page__spinner" />
            <p className="payment-mock-page__loader-text">Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Рендер ошибки "Не найдено"
   */
  if (status === 'not_found') {
    return (
      <div className="payment-mock-page">
        <div className="payment-mock-page__container">
          <div className="payment-mock-page__status">
            <div className="payment-mock-page__status-icon payment-mock-page__status-icon--error">
              ❌
            </div>
            <h2 className="payment-mock-page__status-title">Бронирование не найдено</h2>
            <p className="payment-mock-page__status-message">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Рендер состояния "Уже оплачено"
   */
  if (status === 'already_paid') {
    return (
      <div className="payment-mock-page">
        <div className="payment-mock-page__container">
          <div className="payment-mock-page__status">
            <div className="payment-mock-page__status-icon payment-mock-page__status-icon--warning">
              ⚠️
            </div>
            <h2 className="payment-mock-page__status-title">Бронирование уже оплачено</h2>
            <p className="payment-mock-page__status-message">
              Данное бронирование уже было оплачено ранее.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Рендер состояния "Обработка"
   */
  if (status === 'processing') {
    return (
      <div className="payment-mock-page">
        <div className="payment-mock-page__container">
          <div className="payment-mock-page__loader">
            <div className="payment-mock-page__spinner" />
            <p className="payment-mock-page__loader-text">Обработка платежа...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Рендер состояния "Успех"
   */
  if (status === 'success') {
    return (
      <div className="payment-mock-page">
        <div className="payment-mock-page__container">
          <div className="payment-mock-page__status">
            <div className="payment-mock-page__status-icon payment-mock-page__status-icon--success">
              ✅
            </div>
            <h2 className="payment-mock-page__status-title">Оплата прошла успешно!</h2>
            <p className="payment-mock-page__status-message">
              Ваш платеж на сумму <strong>{formatAmount(booking!.total_cost)}</strong> успешно обработан.
              <br />
              Спасибо за использование наших услуг!
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Рендер состояния "Ошибка"
   */
  if (status === 'error') {
    return (
      <div className="payment-mock-page">
        <div className="payment-mock-page__container">
          <div className="payment-mock-page__status">
            <div className="payment-mock-page__status-icon payment-mock-page__status-icon--error">
              ❌
            </div>
            <h2 className="payment-mock-page__status-title">Ошибка оплаты</h2>
            <p className="payment-mock-page__status-message">{errorMessage}</p>
            <AppButton
              variant="primary"
              size="L"
              onClick={handleRetry}
            >
              Попробовать еще раз
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Рендер формы оплаты (состояние "ready")
   */
  return (
    <div className="payment-mock-page">
      <div className="payment-mock-page__container">
        {/* Заголовок */}
        <div className="payment-mock-page__header">
          <h1 className="payment-mock-page__title">
            <span className="payment-mock-page__security-icon">🔒</span>
            Оплата услуг автосервиса
          </h1>
          <p className="payment-mock-page__subtitle">Безопасный платеж</p>
        </div>

        {/* Информация о платеже */}
        <div className="payment-mock-page__amount">
          <p className="payment-mock-page__amount-label">К оплате:</p>
          <h2 className="payment-mock-page__amount-value">
            {formatAmount(booking!.total_cost)}
          </h2>
          <p className="payment-mock-page__description">
            {booking!.service.name}
            {booking!.additionalServices && booking!.additionalServices.length > 0 && (
              <> + {booking!.additionalServices.length} доп. услуг</>
            )}
          </p>
        </div>

        {/* Форма оплаты */}
        <form className="payment-mock-page__form" onSubmit={handleSubmit}>
          {/* Номер карты */}
          <div className="payment-mock-page__input-group">
            <label className="payment-mock-page__label" htmlFor="cardNumber">
              Номер карты
            </label>
            <input
              id="cardNumber"
              type="text"
              className={`payment-mock-page__input ${
                touched.cardNumber && fieldErrors.cardNumber ? 'payment-mock-page__input--error' : ''
              }`}
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleFieldChange('cardNumber', e.target.value)}
              onBlur={() => handleFieldBlur('cardNumber')}
            />
            {touched.cardNumber && fieldErrors.cardNumber && (
              <p className="payment-mock-page__error-text">{fieldErrors.cardNumber}</p>
            )}
          </div>

          {/* Срок действия и CVV */}
          <div className="payment-mock-page__row">
            <div className="payment-mock-page__input-group">
              <label className="payment-mock-page__label" htmlFor="expiryDate">
                Срок действия
              </label>
              <input
                id="expiryDate"
                type="text"
                className={`payment-mock-page__input ${
                  touched.expiryDate && fieldErrors.expiryDate ? 'payment-mock-page__input--error' : ''
                }`}
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                onBlur={() => handleFieldBlur('expiryDate')}
              />
              {touched.expiryDate && fieldErrors.expiryDate && (
                <p className="payment-mock-page__error-text">{fieldErrors.expiryDate}</p>
              )}
            </div>

            <div className="payment-mock-page__input-group">
              <label className="payment-mock-page__label" htmlFor="cvv">
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                className={`payment-mock-page__input ${
                  touched.cvv && fieldErrors.cvv ? 'payment-mock-page__input--error' : ''
                }`}
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => handleFieldChange('cvv', e.target.value)}
                onBlur={() => handleFieldBlur('cvv')}
              />
              {touched.cvv && fieldErrors.cvv && (
                <p className="payment-mock-page__error-text">{fieldErrors.cvv}</p>
              )}
            </div>
          </div>

          {/* Имя держателя */}
          <div className="payment-mock-page__input-group">
            <label className="payment-mock-page__label" htmlFor="cardholderName">
              Имя держателя карты (опционально)
            </label>
            <input
              id="cardholderName"
              type="text"
              className={`payment-mock-page__input ${
                touched.cardholderName && fieldErrors.cardholderName ? 'payment-mock-page__input--error' : ''
              }`}
              placeholder="IVAN IVANOV"
              value={formData.cardholderName}
              onChange={(e) => handleFieldChange('cardholderName', e.target.value)}
              onBlur={() => handleFieldBlur('cardholderName')}
            />
            {touched.cardholderName && fieldErrors.cardholderName && (
              <p className="payment-mock-page__error-text">{fieldErrors.cardholderName}</p>
            )}
          </div>

          {/* Кнопка оплаты */}
          <div className="payment-mock-page__submit-button">
            <AppButton
              type="submit"
              variant="primary"
              size="L"
              disabled={!canSubmit}
              loading={false}
              className="payment-mock-page__submit-button-full"
            >
              Оплатить {formatAmount(booking!.total_cost)}
            </AppButton>
          </div>
        </form>

        {/* Примечание о безопасности */}
        <div className="payment-mock-page__security-note">
          <span>🔒</span>
          <span>Все данные передаются по защищенному соединению</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMockPage;

/**
 * Типы для страницы мок-платежа
 */

/**
 * Типы сообщений для PostMessage API
 */
export type PaymentMessageType = 
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_ERROR'
  | 'PAYMENT_CANCELLED';

/**
 * Данные для успешного платежа
 */
export interface PaymentSuccessData {
  bookingUuid: string;
  paymentUuid: string;
  amount: number;
  timestamp: string;
}

/**
 * Данные для ошибки платежа
 */
export interface PaymentErrorData {
  bookingUuid: string;
  error: string;
  errorCode: string;
  timestamp: string;
}

/**
 * Данные для отмены платежа
 */
export interface PaymentCancelledData {
  bookingUuid: string;
  timestamp: string;
}

/**
 * Универсальное сообщение PostMessage
 */
export interface PaymentMessage {
  type: PaymentMessageType;
  data: PaymentSuccessData | PaymentErrorData | PaymentCancelledData;
}

/**
 * Данные формы платежа
 */
export interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

/**
 * Статусы страницы оплаты
 */
export type PaymentPageStatus = 
  | 'loading'      // Загрузка данных о бронировании
  | 'ready'        // Готова к оплате
  | 'processing'   // Обработка платежа
  | 'success'      // Успешная оплата
  | 'error'        // Ошибка
  | 'already_paid' // Уже оплачено
  | 'not_found';   // Бронирование не найдено

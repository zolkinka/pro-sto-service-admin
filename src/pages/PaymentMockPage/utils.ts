/**
 * Утилиты для страницы мок-платежа
 */

/**
 * Маска для номера карты (формат XXXX XXXX XXXX XXXX)
 */
export const formatCardNumber = (value: string): string => {
  // Удаляем все нечисловые символы
  const cleaned = value.replace(/\D/g, '');
  
  // Ограничиваем 16 символами
  const limited = cleaned.slice(0, 16);
  
  // Разбиваем на группы по 4 цифры
  const groups = limited.match(/.{1,4}/g) || [];
  
  return groups.join(' ');
};

/**
 * Маска для срока действия (формат MM/YY)
 */
export const formatExpiryDate = (value: string): string => {
  // Удаляем все нечисловые символы
  const cleaned = value.replace(/\D/g, '');
  
  // Ограничиваем 4 символами
  const limited = cleaned.slice(0, 4);
  
  // Добавляем слэш после двух цифр
  if (limited.length >= 2) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  }
  
  return limited;
};

/**
 * Маска для CVV (формат XXX)
 */
export const formatCVV = (value: string): string => {
  // Удаляем все нечисловые символы и ограничиваем 3 символами
  return value.replace(/\D/g, '').slice(0, 3);
};

/**
 * Форматирование имени держателя (только латинские буквы и пробелы)
 */
export const formatCardholderName = (value: string): string => {
  // Оставляем только латинские буквы и пробелы
  return value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
};

/**
 * Базовая валидация номера карты (проверка длины)
 */
export const validateCardNumber = (value: string): boolean => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 16;
};

/**
 * Валидация срока действия
 */
export const validateExpiryDate = (value: string): boolean => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length !== 4) {
    return false;
  }
  
  const month = parseInt(cleaned.slice(0, 2), 10);
  const year = parseInt(cleaned.slice(2), 10);
  
  // Проверка месяца (01-12)
  if (month < 1 || month > 12) {
    return false;
  }
  
  // Проверка что карта не истекла
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Последние 2 цифры года
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) {
    return false;
  }
  
  if (year === currentYear && month < currentMonth) {
    return false;
  }
  
  return true;
};

/**
 * Валидация CVV
 */
export const validateCVV = (value: string): boolean => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 3;
};

/**
 * Валидация имени держателя карты
 */
export const validateCardholderName = (value: string): boolean => {
  // Минимум 2 символа
  return value.trim().length >= 2;
};

/**
 * Проверка, все ли поля формы заполнены корректно
 */
export const isFormValid = (
  cardNumber: string,
  expiryDate: string,
  cvv: string,
  cardholderName: string
): boolean => {
  return (
    validateCardNumber(cardNumber) &&
    validateExpiryDate(expiryDate) &&
    validateCVV(cvv) &&
    validateCardholderName(cardholderName)
  );
};

/**
 * Форматирование суммы для отображения
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Генерация UUID для платежа (простая имитация)
 */
export const generatePaymentUuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

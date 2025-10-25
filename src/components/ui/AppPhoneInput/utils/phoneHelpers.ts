/**
 * Утилиты для работы с номерами телефонов
 */

/**
 * Извлекает только цифры из форматированного номера телефона
 * "+7 (916) 123-45-67" -> "9161234567"
 */
export const extractPhoneDigits = (formattedPhone: string): string => {
  const allDigits = formattedPhone.replace(/\D/g, '');
  // Убираем код страны (7)
  return allDigits.startsWith('7') ? allDigits.slice(1) : allDigits;
};

/**
 * Валидация российского номера телефона
 * Должно быть 10 цифр после +7
 */
export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
};

/**
 * Форматирует чистый номер телефона в формат с маской
 * "9161234567" -> "+7 (916) 123-45-67"
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return `+7 (${cleaned}`;
  if (cleaned.length <= 6) return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  if (cleaned.length <= 8) return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  
  return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`;
};

/**
 * Проверяет, является ли номер полным (10 цифр)
 */
export const isPhoneComplete = (phone: string): boolean => {
  const digits = extractPhoneDigits(phone);
  return digits.length === 10;
};

/**
 * Очищает номер телефона для отправки на сервер
 * Возвращает только цифры без +7
 */
export const cleanPhoneForSubmit = (phone: string): string => {
  return extractPhoneDigits(phone);
};

import type { SchedulePayload, ValidationErrors, WeekDay } from './types';

const DAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Валидирует payload расписания перед сохранением.
 * Возвращает объект ошибок по дням/полям. Пустой объект означает отсутствие ошибок.
 */
export function validateSchedulePayload(pendingScheduleData: SchedulePayload | null): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!pendingScheduleData) {
    return errors;
  }

  for (const day of DAYS) {
    const dayData = pendingScheduleData[day];

    // Пропускаем выходные дни
    if (dayData?.is_closed) {
      continue;
    }

    const openTime = dayData?.open_time;
    const closeTime = dayData?.close_time;

    // Случаи, когда не выбрано время
    if (!openTime || !closeTime) {
      if (!openTime && !closeTime) {
        errors[day] = {
          open: 'Укажите время открытия и закрытия',
          close: 'Укажите время открытия и закрытия',
        };
      } else if (!openTime) {
        errors[day] = {
          open: 'Укажите время открытия',
        };
      } else if (!closeTime) {
        errors[day] = {
          close: 'Укажите время закрытия',
        };
      }

      continue;
    }

    // Проверяем, что время открытия меньше времени закрытия
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    if (openMinutes >= closeMinutes) {
      errors[day] = {
        close: 'Время открытия должно быть раньше времени закрытия',
      };
    }
  }

  return errors;
}

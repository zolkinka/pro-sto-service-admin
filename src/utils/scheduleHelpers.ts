/**
 * Утилиты для работы с расписанием работы сервисного центра
 */

import { format } from 'date-fns';
import type { OperatingHoursResponseDto } from '../../services/api-client/types.gen';

/**
 * Преобразует объект времени в строку формата "HH:mm"
 */
const formatTimeObject = (time: { [key: string]: unknown } | string | null | undefined): string | null => {
  if (!time) return null;
  
  // Если время уже строка (например "09:00:00"), извлекаем HH:mm
  if (typeof time === 'string') {
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }
  
  // Время приходит в формате { hour: 9, minute: 0 } или подобном
  const hour = typeof time.hour === 'number' ? time.hour : null;
  const minute = typeof time.minute === 'number' ? time.minute : null;
  
  if (hour === null || minute === null) return null;
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

/**
 * Получает день недели в формате API из объекта Date
 */
const getDayOfWeek = (date: Date): OperatingHoursResponseDto['day_of_week'] => {
  const dayMap: Record<number, OperatingHoursResponseDto['day_of_week']> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  
  return dayMap[date.getDay()] || null;
};

/**
 * Проверяет, является ли дата выходным днем (из списка специальных дат)
 */
export const isSpecialDateClosed = (
  date: Date,
  specialDates: OperatingHoursResponseDto[]
): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const specialDate = specialDates.find((sd) => sd.specific_date === dateStr);
  
  return specialDate?.is_closed || false;
};

/**
 * Получает рабочие часы для конкретной даты
 * @returns объект с открытием и закрытием в формате "HH:mm" или null если выходной
 */
export const getWorkingHoursForDate = (
  date: Date,
  regularSchedule: OperatingHoursResponseDto[],
  specialDates: OperatingHoursResponseDto[]
): { open: string; close: string } | null => {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Сначала проверяем специальные даты
  const specialDate = specialDates.find((sd) => sd.specific_date === dateStr);
  if (specialDate) {
    if (specialDate.is_closed) {
      return null; // Выходной день
    }
    
    const openTime = formatTimeObject(specialDate.open_time);
    const closeTime = formatTimeObject(specialDate.close_time);
    
    if (openTime && closeTime) {
      return { open: openTime, close: closeTime };
    }
  }
  
  // Если нет специальной даты, проверяем регулярное расписание
  const dayOfWeek = getDayOfWeek(date);
  const regularDay = regularSchedule.find((rd) => rd.day_of_week === dayOfWeek);
  
  if (!regularDay) {
    return null; // Нет информации о расписании
  }
  
  if (regularDay.is_closed) {
    return null; // Выходной день
  }
  
  const openTime = formatTimeObject(regularDay.open_time);
  const closeTime = formatTimeObject(regularDay.close_time);
  
  if (openTime && closeTime) {
    return { open: openTime, close: closeTime };
  }
  
  return null;
};

/**
 * Проверяет, находится ли время в рабочих часах
 */
export const isTimeInWorkingHours = (
  time: string, // формат "HH:mm"
  workingHours: { open: string; close: string } | null
): boolean => {
  if (!workingHours) return false;
  
  return time >= workingHours.open && time < workingHours.close;
};

/**
 * Получает список рабочих часов (слотов) для даты
 * @returns массив строк в формате "HH:00"
 */
export const getWorkingTimeSlots = (
  date: Date,
  regularSchedule: OperatingHoursResponseDto[],
  specialDates: OperatingHoursResponseDto[]
): string[] => {
  const workingHours = getWorkingHoursForDate(date, regularSchedule, specialDates);
  
  if (!workingHours) {
    return []; // Выходной день
  }
  
  const slots: string[] = [];
  const [openHour] = workingHours.open.split(':').map(Number);
  const [closeHour] = workingHours.close.split(':').map(Number);
  
  for (let hour = openHour; hour < closeHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  return slots;
};

/**
 * Получает диапазон рабочих часов для недели
 * @returns объект с минимальным и максимальным часом работы { start: number, end: number }
 */
export const getWorkingHoursRangeForWeek = (
  weekStart: Date,
  regularSchedule: OperatingHoursResponseDto[],
  specialDates: OperatingHoursResponseDto[]
): { start: number; end: number } => {
  let minHour = 24;
  let maxHour = 0;
  
  // Проверяем все 7 дней недели
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    
    const workingHours = getWorkingHoursForDate(date, regularSchedule, specialDates);
    
    if (workingHours) {
      const [openHour] = workingHours.open.split(':').map(Number);
      const [closeHour] = workingHours.close.split(':').map(Number);
      
      minHour = Math.min(minHour, openHour);
      maxHour = Math.max(maxHour, closeHour);
    }
  }
  
  // Если не найдено ни одного рабочего дня, возвращаем дефолтные значения
  if (minHour === 24 || maxHour === 0) {
    return { start: 9, end: 18 };
  }
  
  return { start: minHour, end: maxHour };
};

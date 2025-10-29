import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';

export const DAY_NAMES: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
};

export const DAY_SHORT_NAMES: Record<string, string> = {
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Вс',
};

export const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Проверяет, одинаковое ли время работы для всех дней недели
 */
export function hasUniformSchedule(schedule: OperatingHoursResponseDto[]): boolean {
  if (schedule.length === 0) return false;
  
  const first = schedule[0];
  
  return schedule.every(day => {
    if (day.is_closed !== first.is_closed) return false;
    if (day.is_closed) return true;
    
    return (
      JSON.stringify(day.open_time) === JSON.stringify(first.open_time) &&
      JSON.stringify(day.close_time) === JSON.stringify(first.close_time)
    );
  });
}

/**
 * Форматирует время из объекта или строки в строку HH:mm
 */
export function formatTime(time: { [key: string]: unknown } | string | null | undefined): string {
  if (!time) return '';
  
  // Если время уже строка (например "09:00:00"), извлекаем HH:mm
  if (typeof time === 'string') {
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }
  
  // Время приходит в формате { hour: 9, minute: 0 } или подобном
  const hour = typeof time.hour === 'number' ? time.hour : 0;
  const minute = typeof time.minute === 'number' ? time.minute : 0;
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Парсит время из строки HH:mm в объект { hour, minute }
 */
export function parseTime(timeStr: string): { hour: number; minute: number } | null {
  if (!timeStr) return null;
  
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  if (isNaN(hour) || isNaN(minute)) return null;
  
  return { hour, minute };
}

/**
 * Группирует дни с одинаковым расписанием
 */
export function groupDaysBySchedule(schedule: OperatingHoursResponseDto[]): Array<{
  days: string[];
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}> {
  const groups: Array<{
    days: string[];
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }> = [];
  
  const sortedSchedule = [...schedule].sort((a, b) => {
    const aIndex = DAYS_ORDER.indexOf(a.day_of_week || '');
    const bIndex = DAYS_ORDER.indexOf(b.day_of_week || '');
    return aIndex - bIndex;
  });
  
  sortedSchedule.forEach(day => {
    if (!day.day_of_week) return;
    
    const openTime = formatTime(day.open_time);
    const closeTime = formatTime(day.close_time);
    const isClosed = day.is_closed;
    
    const existingGroup = groups.find(g =>
      g.openTime === openTime &&
      g.closeTime === closeTime &&
      g.isClosed === isClosed
    );
    
    if (existingGroup) {
      existingGroup.days.push(day.day_of_week);
    } else {
      groups.push({
        days: [day.day_of_week],
        openTime,
        closeTime,
        isClosed,
      });
    }
  });
  
  return groups;
}

/**
 * Форматирует список дней для отображения
 */
export function formatDaysRange(days: string[]): string {
  if (days.length === 0) return '';
  if (days.length === 1) return DAY_SHORT_NAMES[days[0]] || days[0];
  
  // Проверяем, идут ли дни подряд
  const sortedDays = [...days].sort((a, b) => {
    return DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b);
  });
  
  const isConsecutive = sortedDays.every((day, index) => {
    if (index === 0) return true;
    const prevIndex = DAYS_ORDER.indexOf(sortedDays[index - 1]);
    const currIndex = DAYS_ORDER.indexOf(day);
    return currIndex === prevIndex + 1;
  });
  
  if (isConsecutive) {
    return `${DAY_SHORT_NAMES[sortedDays[0]]}—${DAY_SHORT_NAMES[sortedDays[sortedDays.length - 1]]}`;
  }
  
  return sortedDays.map(d => DAY_SHORT_NAMES[d]).join(', ');
}

/**
 * Проверяет валидность времени (закрытие должно быть позже открытия)
 */
export function validateTimeRange(openTime: string, closeTime: string): boolean {
  if (!openTime || !closeTime) return false;
  
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
  if (closeHour > openHour) return true;
  if (closeHour === openHour && closeMinute > openMinute) return true;
  
  return false;
}

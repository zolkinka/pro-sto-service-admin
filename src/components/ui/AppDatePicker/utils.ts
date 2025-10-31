/**
 * Утилиты для работы с датами в AppDatePicker
 */

/** Локализация дней недели на русском */
export const WEEK_DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Локализация месяцев на русском */
export const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

/** Локализация дней недели на английском */
export const WEEK_DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Локализация месяцев на английском */
export const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Тип для ячейки календаря */
export interface CalendarCell {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Форматирует дату в DD.MM.YYYY
 * @param date - Дата для форматирования
 * @returns Строка в формате DD.MM.YYYY
 */
export const formatDateToDDMMYYYY = (date: Date | null): string => {
  if (!date) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

/**
 * Парсит строку даты в формате DD.MM.YYYY в объект Date
 * @param dateString - Строка даты в формате DD.MM.YYYY
 * @returns Date объект или null при ошибке
 */
export const parseDateFromDDMMYYYY = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const parts = dateString.split('.');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // месяцы в JS начинаются с 0
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  const date = new Date(year, month, day);
  
  // Проверка валидности даты
  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  
  return date;
};

/**
 * Форматирует название месяца и года
 * @param date - Дата
 * @param locale - Локаль ('ru' | 'en')
 * @returns Строка в формате "Месяц Год" (например: "Январь 2022")
 */
export const formatMonthYear = (date: Date, locale: 'ru' | 'en' = 'ru'): string => {
  const months = locale === 'ru' ? MONTHS_RU : MONTHS_EN;
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${month} ${year}`;
};

/**
 * Проверяет, является ли дата сегодняшней
 * @param date - Дата для проверки
 * @returns true если дата сегодняшняя
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Проверяет, равны ли две даты (игнорируя время)
 * @param date1 - Первая дата
 * @param date2 - Вторая дата
 * @returns true если даты равны
 */
export const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Получает первый день месяца
 * @param year - Год
 * @param month - Месяц (0-11)
 * @returns Date объект первого дня месяца
 */
const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

/**
 * Получает последний день месяца
 * @param year - Год
 * @param month - Месяц (0-11)
 * @returns Date объект последнего дня месяца
 */
const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

/**
 * Получает день недели (0 = Понедельник, 6 = Воскресенье)
 * @param date - Дата
 * @returns Номер дня недели (0-6)
 */
const getWeekDay = (date: Date): number => {
  const day = date.getDay();
  // Преобразуем воскресенье (0) в 6, остальные дни сдвигаем на -1
  return day === 0 ? 6 : day - 1;
};

/**
 * Генерирует сетку календаря для указанного месяца
 * @param year - Год
 * @param month - Месяц (0-11)
 * @returns Массив недель, каждая неделя содержит 7 дней
 */
export const generateCalendarGrid = (
  year: number,
  month: number
): CalendarCell[][] => {
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);
  
  const firstWeekDay = getWeekDay(firstDay);
  const lastDate = lastDay.getDate();
  
  const calendar: CalendarCell[][] = [];
  let week: CalendarCell[] = [];
  
  // Добавляем дни предыдущего месяца
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = getLastDayOfMonth(prevYear, prevMonth).getDate();
  
  for (let i = firstWeekDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(prevYear, prevMonth, day);
    
    week.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isToday(date),
    });
  }
  
  // Добавляем дни текущего месяца
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    
    week.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isToday(date),
    });
    
    // Если неделя заполнена (7 дней), добавляем её в календарь
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }
  
  // Добавляем дни следующего месяца
  if (week.length > 0) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    let day = 1;
    while (week.length < 7) {
      const date = new Date(nextYear, nextMonth, day);
      
      week.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: isToday(date),
      });
      
      day++;
    }
    
    calendar.push(week);
  }
  
  return calendar;
};

/**
 * Парсит значение даты (Date или string) в Date объект
 * @param value - Значение даты
 * @returns Date объект или null
 */
export const parseDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  
  if (value instanceof Date) {
    return value;
  }
  
  if (typeof value === 'string') {
    // Пробуем распарсить в формате DD.MM.YYYY
    const parsed = parseDateFromDDMMYYYY(value);
    if (parsed) return parsed;
    
    // Пробуем стандартный парсинг
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
};

/**
 * Получает дни недели по локали
 * @param locale - Локаль ('ru' | 'en')
 * @returns Массив названий дней недели
 */
export const getWeekDays = (locale: 'ru' | 'en' = 'ru'): string[] => {
  return locale === 'ru' ? WEEK_DAYS_RU : WEEK_DAYS_EN;
};

/**
 * Проверяет, является ли дата отключенной
 * @param date - Проверяемая дата
 * @param minDate - Минимальная доступная дата
 * @param maxDate - Максимальная доступная дата
 * @param disabledDates - Массив отключенных дат
 * @returns true если дата отключена
 */
export const isDateDisabled = (
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[]
): boolean => {
  // Проверка minDate
  if (minDate && date < minDate) {
    return true;
  }
  
  // Проверка maxDate
  if (maxDate && date > maxDate) {
    return true;
  }
  
  // Проверка disabledDates
  if (disabledDates && disabledDates.length > 0) {
    return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
  }
  
  return false;
};

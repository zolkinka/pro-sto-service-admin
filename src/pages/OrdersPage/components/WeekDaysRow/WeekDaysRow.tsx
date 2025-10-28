import React from 'react';
import { format, isSameDay, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import './WeekDaysRow.css';

export interface WeekDaysRowProps {
  startDate: Date; // первый день недели
  currentDate: Date; // текущий день
}

export const WeekDaysRow: React.FC<WeekDaysRowProps> = ({ startDate, currentDate }) => {
  // Генерируем массив из 7 дней начиная с startDate
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(startDate, index));

  // Получаем название месяца из первого дня
  const monthName = format(startDate, 'LLLL', { locale: ru });
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="week-days-row">
      <div className="week-days-row__month">{capitalizedMonthName}</div>
      <div className="week-days-row__days">
        {weekDays.map((day, index) => {
          const isCurrentDay = isSameDay(day, currentDate);
          const dayOfWeek = format(day, 'EEEEEE', { locale: ru }); // пн, вт, ср...
          const dayNumber = format(day, 'd'); // 18, 19, 20...

          return (
            <div
              key={index}
              className={`week-days-row__day ${isCurrentDay ? 'week-days-row__day_current' : ''}`}
            >
              <span className="week-days-row__day-name">{dayOfWeek}</span>
              <span className="week-days-row__day-number">{dayNumber}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekDaysRow;

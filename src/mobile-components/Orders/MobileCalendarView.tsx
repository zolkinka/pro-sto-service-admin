import React from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import './MobileCalendarView.css';

interface MobileCalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const formattedDate = format(selectedDate, 'd MMMM yyyy', { locale: ru });
  const dayOfWeek = format(selectedDate, 'EEEE', { locale: ru });

  const showTodayButton = !isToday(selectedDate);

  return (
    <div className="mobile-calendar-view">
      <div className="mobile-calendar-view__header">
        <button 
          className="mobile-calendar-view__nav-button"
          onClick={handlePrevDay}
          aria-label="Предыдущий день"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="mobile-calendar-view__date">
          <div className="mobile-calendar-view__date-main">
            {formattedDate}
          </div>
          <div className="mobile-calendar-view__date-weekday">
            {dayOfWeek}
          </div>
        </div>

        <button 
          className="mobile-calendar-view__nav-button"
          onClick={handleNextDay}
          aria-label="Следующий день"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {showTodayButton && (
        <div className="mobile-calendar-view__today">
          <button 
            className="mobile-calendar-view__today-button"
            onClick={handleToday}
          >
            Сегодня
          </button>
        </div>
      )}
    </div>
  );
};

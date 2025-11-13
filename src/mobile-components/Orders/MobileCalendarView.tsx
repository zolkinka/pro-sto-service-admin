import React from 'react';
import { format, addDays, subDays } from 'date-fns';
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

  const formattedDate = format(selectedDate, 'd MMMM', { locale: ru });

  return (
    <div className="mobile-calendar-view">
      <button 
        className="mobile-calendar-view__nav-button"
        onClick={handlePrevDay}
        aria-label="Предыдущий день"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="mobile-calendar-view__date">
        {formattedDate}
      </div>

      <button 
        className="mobile-calendar-view__nav-button"
        onClick={handleNextDay}
        aria-label="Следующий день"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

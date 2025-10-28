import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import './CalendarHeader.css';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: 'day' | 'week';
  onViewModeChange: (mode: 'day' | 'week') => void;
}

const ClockIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="14"
      cy="14"
      r="10.5"
      stroke="#302F2D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 7V14L18.2 18.2"
      stroke="#302F2D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronLeftIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.5 15L7.5 10L12.5 5"
      stroke="#302F2D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="#302F2D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevious = () => {
    const newDate = dayjs(currentDate)
      .subtract(viewMode === 'week' ? 7 : 1, 'day')
      .toDate();
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = dayjs(currentDate)
      .add(viewMode === 'week' ? 7 : 1, 'day')
      .toDate();
    onDateChange(newDate);
  };

  const formattedTime = dayjs(currentTime).format('HH:mm:ss');

  return (
    <div className="calendar-header">
      <div className="calendar-header__tabs">
        <button
          className={`calendar-header__tab ${viewMode === 'day' ? 'calendar-header__tab_active' : ''}`}
          onClick={() => onViewModeChange('day')}
          disabled={true}
        >
          День
        </button>
        <button
          className={`calendar-header__tab ${viewMode === 'week' ? 'calendar-header__tab_active' : ''}`}
          onClick={() => onViewModeChange('week')}
        >
          Неделя
        </button>
      </div>

      <div className="calendar-header__time">
        <ClockIcon />
        <span className="calendar-header__time-text">{formattedTime}</span>
      </div>

      <div className="calendar-header__navigation">
        <button
          className="calendar-header__nav-button"
          onClick={handlePrevious}
          aria-label="Предыдущая неделя"
        >
          <ChevronLeftIcon />
        </button>
        <button
          className="calendar-header__nav-button"
          onClick={handleNext}
          aria-label="Следующая неделя"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;

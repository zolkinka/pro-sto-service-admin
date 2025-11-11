import React from 'react';
import classNames from 'classnames';
import type { DateNavigationProps } from './DateNavigation.types';
import './DateNavigation.css';

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const formatDate = (date: Date, period: 'month' | 'week'): string => {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  if (period === 'month') {
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  }

  // For week: calculate start and end of week
  const startOfWeek = new Date(date);
  const dayOfWeek = startOfWeek.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as first day
  startOfWeek.setDate(startOfWeek.getDate() + diff);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const startDay = startOfWeek.getDate();
  const endDay = endOfWeek.getDate();
  const startMonth = months[startOfWeek.getMonth()];
  const endMonth = months[endOfWeek.getMonth()];

  if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
    return `${startDay}-${endDay} ${endMonth}`;
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }
};

export const DateNavigation: React.FC<DateNavigationProps> = ({
  date,
  period,
  onPrevious,
  onNext,
  disabled = false,
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        action();
      }
    }
  };

  return (
    <div className={classNames('date-navigation', className)} role="navigation" aria-label="Навигация по датам">
      <button
        type="button"
        className="date-navigation__button"
        onClick={onPrevious}
        disabled={disabled}
        onKeyDown={(e) => handleKeyDown(e, onPrevious)}
        aria-label="Предыдущий период"
        data-testid="date-navigation-previous"
      >
        <ChevronLeftIcon />
      </button>
      
      <div className="date-navigation__date" aria-live="polite">
        {formatDate(date, period)}
      </div>
      
      <button
        type="button"
        className="date-navigation__button"
        onClick={onNext}
        disabled={disabled}
        onKeyDown={(e) => handleKeyDown(e, onNext)}
        aria-label="Следующий период"
        data-testid="date-navigation-next"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};

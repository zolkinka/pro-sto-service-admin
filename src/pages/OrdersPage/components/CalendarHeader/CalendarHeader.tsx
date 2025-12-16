import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { format, isSameDay, addDays, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { NewBookingBanner } from '@/components/NewBookingBanner';
import './CalendarHeader.css';

type ServiceCategory = 'car_wash' | 'tire_service';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: 'day' | 'week';
  onViewModeChange: (mode: 'day' | 'week') => void;
  serviceCategory: ServiceCategory;
  onServiceCategoryChange: (category: ServiceCategory) => void;
  onAddBooking: () => void;
  availableCategories: ServiceCategory[];
  pendingBookingsCount?: number;
  onPendingBookingsClick?: () => void;
}

const ClockIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="14"
      cy="14"
      r="10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 7V14L18.2 18.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 4.16669V15.8334M4.16669 10H15.8334"
      stroke="currentColor"
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
      stroke="currentColor"
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
      stroke="currentColor"
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
  serviceCategory,
  onServiceCategoryChange,
  onAddBooking,
  pendingBookingsCount = 0,
  onPendingBookingsClick,
  availableCategories,
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

  // Генерируем дни недели
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekEnd = addDays(weekStart, 6);

  const weekRangeLabel = (() => {
    const isSameMonth = weekStart.getMonth() === weekEnd.getMonth() && weekStart.getFullYear() === weekEnd.getFullYear();
    if (isSameMonth) {
      return `${format(weekStart, 'd', { locale: ru })}-${format(weekEnd, 'd MMMM', { locale: ru })}`;
    }
    return `${format(weekStart, 'd MMMM', { locale: ru })}-${format(weekEnd, 'd MMMM', { locale: ru })}`;
  })();

  return (
    <>
      <div className="calendar-header">
        <div className="calendar-header__left">
          {pendingBookingsCount > 0 && onPendingBookingsClick ? (
            <NewBookingBanner
              count={pendingBookingsCount}
              onClick={onPendingBookingsClick}
            />
          ) : (
            <button
              className="calendar-header__add"
              onClick={onAddBooking}
              type="button"
              aria-label="Добавить запись"
            >
              <span className="calendar-header__add-text">Добавить запись</span>
              <span className="calendar-header__add-icon" aria-hidden="true">
                <PlusIcon />
              </span>
            </button>
          )}
{availableCategories.length > 1 && (
            <div className="calendar-header__service-tabs" aria-label="Тип сервиса">
              {availableCategories.includes('car_wash') && (
                <button
                  className={`calendar-header__service-tab ${serviceCategory === 'car_wash' ? 'calendar-header__service-tab_active' : ''}`}
                  onClick={() => onServiceCategoryChange('car_wash')}
                  type="button"
                >
                  Мойка
                </button>
              )}
              {availableCategories.includes('tire_service') && (
                <button
                  className={`calendar-header__service-tab ${serviceCategory === 'tire_service' ? 'calendar-header__service-tab_active' : ''}`}
                  onClick={() => onServiceCategoryChange('tire_service')}
                  type="button"
                >
                  Шиномонтаж
                </button>
              )}
            </div>
          )}

          <div className="calendar-header__time">
            <ClockIcon />
            <span className="calendar-header__time-text">{formattedTime}</span>
          </div>
        </div>

        <div className="calendar-header__right">
          <div className="calendar-header__tabs" aria-label="Режим отображения">
            <button
              className={`calendar-header__tab ${viewMode === 'day' ? 'calendar-header__tab_active' : ''}`}
              onClick={() => onViewModeChange('day')}
              type="button"
            >
              День
            </button>
            <button
              className={`calendar-header__tab ${viewMode === 'week' ? 'calendar-header__tab_active' : ''}`}
              onClick={() => onViewModeChange('week')}
              type="button"
            >
              Неделя
            </button>
          </div>

          <div className="calendar-header__navigation" aria-label={viewMode === 'day' ? 'Переключение дня' : 'Переключение недели'}>
            <button
              className="calendar-header__nav-button"
              onClick={handlePrevious}
              aria-label={viewMode === 'day' ? 'Предыдущий день' : 'Предыдущая неделя'}
              type="button"
            >
              <ChevronLeftIcon />
            </button>
            <span className="calendar-header__week-range" aria-label={viewMode === 'day' ? 'Текущий день' : 'Текущая неделя'}>
              {viewMode === 'day' ? format(currentDate, 'd MMMM', { locale: ru }) : weekRangeLabel}
            </span>
            <button
              className="calendar-header__nav-button"
              onClick={handleNext}
              aria-label={viewMode === 'day' ? 'Следующий день' : 'Следующая неделя'}
              type="button"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Week Days Row - интегрированная часть заголовка (только для режима 'неделя') */}
      {viewMode === 'week' && (
        <div className="calendar-header__week-days">
          <div className="calendar-header__time-label">Время</div>
          <div className="calendar-header__days">
            {weekDays.map((day, index) => {
              const isCurrentDay = isSameDay(day, currentDate);
              const dayOfWeek = format(day, 'EEEEEE', { locale: ru });
              const dayNumber = format(day, 'd');

              const handleDayClick = () => {
                onDateChange(day);
                onViewModeChange('day');
              };

              return (
                <button
                  key={index}
                  className={`calendar-header__day ${isCurrentDay ? 'calendar-header__day_current' : ''}`}
                  onClick={handleDayClick}
                  type="button"
                  aria-label={`Перейти к ${format(day, 'd MMMM', { locale: ru })}`}
                >
                  <span className="calendar-header__day-name">{dayOfWeek}</span>
                  <span className="calendar-header__day-number">{dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarHeader;

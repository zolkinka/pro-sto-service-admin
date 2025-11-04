import React from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import AppButton from '@/components/ui/AppButton/AppButton';
import { EditIcon } from '@/components/ui/icons';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';
import { formatTime, DAY_NAMES, DAYS_ORDER } from './utils';

interface OperatingHoursViewProps {
  schedule: OperatingHoursResponseDto[];
  specialDates: OperatingHoursResponseDto[];
  onEdit: () => void;
  onOpenHolidayModal: () => void;
}

const OperatingHoursView: React.FC<OperatingHoursViewProps> = ({ 
  schedule, 
  specialDates,
  onEdit,
  onOpenHolidayModal 
}) => {
  // Создаем мапу дней для быстрого доступа
  const scheduleMap = schedule.reduce((acc, day) => {
    if (day.day_of_week) {
      acc[day.day_of_week] = day;
    }
    return acc;
  }, {} as Record<string, OperatingHoursResponseDto>);

  // Форматируем специальные даты для отображения
  const formatSpecialDates = () => {
    if (!specialDates || specialDates.length === 0) {
      return 'Не указаны';
    }

    return specialDates
      .filter(d => d.specific_date && d.is_closed)
      .map(d => {
        try {
          const date = parseISO(d.specific_date!);
          return format(date, 'd MMMM', { locale: ru });
        } catch (error) {
          console.error('Error parsing date:', error);
          return d.specific_date;
        }
      })
      .join(', ');
  };

  return (
    <div className="schedule-page__view-wrapper">
      {/* Основное расписание */}
      <div className="schedule-page__view-section">
        <div className="schedule-page__view-section-content">
          <div className="schedule-page__day-schedule-list">
            {DAYS_ORDER.map(day => {
              const daySchedule = scheduleMap[day];
              const dayName = DAY_NAMES[day] || day;
              
              let timeDisplay = '';
              if (daySchedule) {
                if (daySchedule.is_closed) {
                  timeDisplay = 'Выходной';
                } else {
                  const openTime = formatTime(daySchedule.open_time);
                  const closeTime = formatTime(daySchedule.close_time);
                  timeDisplay = `${openTime}—${closeTime}`;
                }
              }

              return (
                <div key={day} className="schedule-page__day-schedule-item">
                  <p className="schedule-page__day-name">{dayName}</p>
                  <p className="schedule-page__day-time">{timeDisplay}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="schedule-page__edit-button-wrapper">
          <AppButton 
            size="M" 
            variant="secondary" 
            onClick={onEdit}
            className="schedule-page__edit-button"
            onlyIcon
            iconLeft={<EditIcon />}
          />
        </div>
      </div>

      {/* Выходные и праздники */}
      <div className="schedule-page__view-section">
        <div className="schedule-page__view-section-content">
          <div className="schedule-page__day-schedule-list">
            <div className="schedule-page__day-schedule-item">
              <p className="schedule-page__day-name">Выходные</p>
              <p className="schedule-page__day-time">{formatSpecialDates()}</p>
            </div>
          </div>
        </div>
        <div className="schedule-page__edit-button-wrapper">
          <AppButton 
            size="M" 
            variant="secondary" 
            onClick={onOpenHolidayModal}
            className="schedule-page__edit-button"
            onlyIcon
            iconLeft={<EditIcon />}
          />
        </div>
      </div>
    </div>
  );
};

export default OperatingHoursView;

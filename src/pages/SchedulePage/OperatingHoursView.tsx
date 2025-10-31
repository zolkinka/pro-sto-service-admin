import React from 'react';
import AppButton from '@/components/ui/AppButton/AppButton';
import { EditIcon } from '@/components/ui/icons';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';
import { formatTime, DAY_NAMES, DAYS_ORDER } from './utils';

interface OperatingHoursViewProps {
  schedule: OperatingHoursResponseDto[];
  onEdit: () => void;
}

const OperatingHoursView: React.FC<OperatingHoursViewProps> = ({ schedule, onEdit }) => {
  // Создаем мапу дней для быстрого доступа
  const scheduleMap = schedule.reduce((acc, day) => {
    if (day.day_of_week) {
      acc[day.day_of_week] = day;
    }
    return acc;
  }, {} as Record<string, OperatingHoursResponseDto>);

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

      {/* Выходные и праздники (пока пустой раздел) */}
      <div className="schedule-page__view-section">
        <div className="schedule-page__view-section-content">
          <div className="schedule-page__day-schedule-list">
            <div className="schedule-page__day-schedule-item">
              <p className="schedule-page__day-name">Выходные</p>
              <p className="schedule-page__day-time">10 апреля, 8 ноября</p>
            </div>
          </div>
        </div>
        <div className="schedule-page__edit-button-wrapper">
          <AppButton 
            size="M" 
            variant="secondary" 
            onClick={() => {}}
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

import React from 'react';
import { format, parseISO, isAfter, isSameDay, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import AppButton from '@/components/ui/AppButton/AppButton';
import { EditIcon } from '@/components/ui/icons';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';
import { formatTime, DAY_NAMES, DAYS_ORDER } from './utils';

interface OperatingHoursViewProps {
  schedule: OperatingHoursResponseDto[];
  specialDates: OperatingHoursResponseDto[];
  onEdit: () => void;
}

const OperatingHoursView: React.FC<OperatingHoursViewProps> = ({ 
  schedule, 
  specialDates,
  onEdit
}) => {
  // Мапа дней недели для быстрого доступа
  const scheduleMap = schedule.reduce((acc, day) => {
    if (day.day_of_week) {
      acc[day.day_of_week] = day;
    }
    return acc;
  }, {} as Record<string, OperatingHoursResponseDto>);

  // Формируем строки для таблицы обычных дней
  const dayRows = DAYS_ORDER.map(day => {
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
    return { label: dayName, value: timeDisplay, type: 'regular', key: day };
  });

  // Формируем строки для таблицы специальных дат
  const today = startOfDay(new Date());
  const specialDateRows = specialDates
    .filter(d => d.specific_date)
    .map(d => {
      try {
        const date = parseISO(d.specific_date!);
        return { ...d, date };
      } catch {
        return null;
      }
    })
    .filter(d => d !== null && (isSameDay(d!.date, today) || isAfter(d!.date, today)))
    .sort((a, b) => a!.date.getTime() - b!.date.getTime())
    .map(d => {
      const formattedDate = format(d!.date, 'd MMMM', { locale: ru });
      let value = '';
      if (d!.is_closed) {
        value = 'Выходной';
      } else {
        value = `${formatTime(d!.open_time)}—${formatTime(d!.close_time)}`;
      }
      return { label: formattedDate, value, type: 'special', key: d!.specific_date! };
    });

  // Итоговые строки для таблицы
  const tableRows = [
    ...dayRows
  ];

  return (
    <div className="schedule-page__view-wrapper">
      <div className="schedule-page__view-card">
        <div className="schedule-page__view-section">
          <div className="schedule-page__view-section-content">
            <h2 className="schedule-page__card-title">Режим работы</h2>
            <table className="schedule-page__table">
              <thead>
                <tr>
                  <th className="schedule-page__table-col schedule-page__table-col-label">День недели</th>
                  <th className="schedule-page__table-col schedule-page__table-col-value">Режим работы</th>
                </tr>
              </thead>
              <tbody>
                {dayRows.map(row => (
                  <tr key={row.key}>
                    <td className="schedule-page__table-cell schedule-page__table-cell-label">{row.label}</td>
                    <td className="schedule-page__table-cell schedule-page__table-cell-value">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Таблица специальных дат */}
            {specialDateRows.length > 0 && (
              <div className="schedule-page__special-dates-section">
                <h3 className="schedule-page__section-subtitle">Выходные и сокращенные дни</h3>
                <table className="schedule-page__table">
                  <thead>
                    <tr>
                      <th className="schedule-page__table-col schedule-page__table-col-label">Дата</th>
                      <th className="schedule-page__table-col schedule-page__table-col-value">Режим работы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialDateRows.map(row => (
                      <tr key={row.key} className="schedule-page__table-row-special">
                        <td className="schedule-page__table-cell schedule-page__table-cell-label">{row.label}</td>
                        <td className="schedule-page__table-cell schedule-page__table-cell-value">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="schedule-page__edit-button-wrapper">
            <AppButton 
              size="M" 
              variant="secondary" 
              onClick={() => {
                window.location.href = '/schedule/edit';
              }}
              className="schedule-page__edit-button"
              onlyIcon
              iconLeft={<EditIcon />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatingHoursView;

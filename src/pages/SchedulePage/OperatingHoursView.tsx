import React from 'react';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
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

    const today = startOfDay(new Date());
    
    // Фильтруем только будущие даты и парсим их
    const futureDates = specialDates
      .filter(d => d.specific_date && d.is_closed)
      .map(d => {
        try {
          const date = parseISO(d.specific_date!);
          return { date, dateStr: d.specific_date! };
        } catch (error) {
          console.error('Error parsing date:', error);
          return null;
        }
      })
      .filter(d => d !== null && isAfter(d.date, today))
      .sort((a, b) => a!.date.getTime() - b!.date.getTime());

    if (futureDates.length === 0) {
      return 'Не указаны';
    }

    // Группируем даты по месяцам
    const datesByMonth: Record<string, number[]> = {};
    
    futureDates.forEach(item => {
      const monthYear = format(item!.date, 'LLLL', { locale: ru }); // например "ноябрь"
      const day = item!.date.getDate();
      
      if (!datesByMonth[monthYear]) {
        datesByMonth[monthYear] = [];
      }
      datesByMonth[monthYear].push(day);
    });

    // Форматируем вывод: "1, 2, 4, 6 ноября, 2, 5, 8 декабря"
    // Конвертируем название месяца в родительный падеж
    const monthToGenitive: Record<string, string> = {
      'январь': 'января',
      'февраль': 'февраля',
      'март': 'марта',
      'апрель': 'апреля',
      'май': 'мая',
      'июнь': 'июня',
      'июль': 'июля',
      'август': 'августа',
      'сентябрь': 'сентября',
      'октябрь': 'октября',
      'ноябрь': 'ноября',
      'декабрь': 'декабря',
    };

    const result = Object.entries(datesByMonth)
      .map(([month, days]) => {
        const genitiveMonth = monthToGenitive[month] || month;
        return `${days.join(', ')} ${genitiveMonth}`;
      })
      .join('\n');

    return result;
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
              <p className="schedule-page__day-time" style={{ whiteSpace: 'pre-line' }}>{formatSpecialDates()}</p>
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

import React, { useState, useEffect, useRef } from 'react';
import { parseISO, format, isAfter, isSameDay, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import AppSwitch from '@/components/ui/AppSwitch/AppSwitch';
import AppButton from '@/components/ui/AppButton/AppButton';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import DayScheduleRow from './DayScheduleRow';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';
import { DAY_NAMES, DAYS_ORDER, formatTime } from './utils';
import type { DayScheduleFormData, ValidationErrors, SchedulePayload, ScheduleDayPayload } from './types';
import './SchedulePage.css';

interface OperatingHoursFormProps {
  schedule: OperatingHoursResponseDto[];
  specialDates: OperatingHoursResponseDto[];
  onScheduleChange?: (data: SchedulePayload) => void;
  onOpenHolidayModal: () => void;
  onDeleteSpecialDate: (specificDate: string) => void;
  validationErrors?: ValidationErrors;
}

interface FormData {
  uniformSchedule: boolean;
  uniformTime: { open: string; close: string };
  weekSchedule: Record<string, DayScheduleFormData>;
}

const OperatingHoursForm: React.FC<OperatingHoursFormProps> = ({ 
  schedule,
  specialDates,
  onScheduleChange,
  onOpenHolidayModal,
  onDeleteSpecialDate,
  validationErrors = {}
}) => {
  // Форматируем специальные даты для отображения
  const formatSpecialDates = () => {
    if (!specialDates || specialDates.length === 0) {
      return null;
    }

    const today = startOfDay(new Date());
    
    // Фильтруем только будущие даты (включая сегодня) - ВСЕ специальные даты, не только выходные
    const futureDates = specialDates
      .filter(d => d.specific_date) // Убрали фильтр && d.is_closed
      .map(d => {
        try {
          const date = parseISO(d.specific_date!);
          return { 
            date, 
            dateStr: d.specific_date!, 
            uuid: d.uuid,
            is_closed: d.is_closed,
            open_time: d.open_time,
            close_time: d.close_time
          };
        } catch (error) {
          console.error('Error parsing date:', error);
          return null;
        }
      })
      .filter(d => d !== null && (isSameDay(d.date, today) || isAfter(d.date, today)))
      .sort((a, b) => a!.date.getTime() - b!.date.getTime());

    if (futureDates.length === 0) {
      return null;
    }

    // Группируем даты по месяцам
    const groupedByMonth = futureDates.reduce<Record<string, typeof futureDates>>((acc, item) => {
      if (!item) return acc;
      const monthKey = format(item.date, 'LLLL yyyy', { locale: ru });
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(item);
      return acc;
    }, {});

    // Форматируем вывод
    return Object.entries(groupedByMonth).map(([month, dates]) => {
      const formattedDates = dates
        .map(d => d ? format(d.date, 'd', { locale: ru }) : '')
        .join(', ');
      return { month, dates: formattedDates, items: dates };
    });
  };

  const [formData, setFormData] = useState<FormData>(() => {
    const initialWeekSchedule: Record<string, DayScheduleFormData> = {};
    
    DAYS_ORDER.forEach(day => {
      const dayData = schedule.find(s => s.day_of_week === day);
      initialWeekSchedule[day] = {
        open: dayData ? formatTime(dayData.open_time) : '09:00',
        close: dayData ? formatTime(dayData.close_time) : '18:00',
        isClosed: dayData ? dayData.is_closed : false,
      };
    });

    // Проверяем, одинаковое ли время для всех дней
    const allSame = DAYS_ORDER.every((day, index) => {
      if (index === 0) return true;
      const first = initialWeekSchedule[DAYS_ORDER[0]];
      const current = initialWeekSchedule[day];
      return (
        first.open === current.open &&
        first.close === current.close
      );
    });

    return {
      uniformSchedule: allSame,
      uniformTime: {
        open: initialWeekSchedule[DAYS_ORDER[0]].open,
        close: initialWeekSchedule[DAYS_ORDER[0]].close,
      },
      weekSchedule: initialWeekSchedule,
    };
  });

  const isFirstRender = useRef(true);
  const prevPayloadRef = useRef<string>('');

  // Отслеживаем изменения в форме и уведомляем родительский компонент
  useEffect(() => {
    // Пропускаем первый рендер (инициализацию)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!onScheduleChange) return;

    // Формируем данные для сохранения
    const timezone = schedule[0]?.timezone || 'Europe/Moscow';
    const updateData: Record<string, ScheduleDayPayload> = {};

    if (formData.uniformSchedule) {
      DAYS_ORDER.forEach(day => {
        updateData[day] = {
          open_time: formData.uniformTime.open,
          close_time: formData.uniformTime.close,
          is_closed: false,
        };
      });
    } else {
      DAYS_ORDER.forEach(day => {
        const daySchedule = formData.weekSchedule[day];
        
        if (daySchedule.isClosed) {
          updateData[day] = {
            is_closed: true,
          };
        } else {
          updateData[day] = {
            open_time: daySchedule.open,
            close_time: daySchedule.close,
            is_closed: false,
          };
        }
      });
    }

    const payload = {
      ...(updateData as Partial<SchedulePayload>),
      timezone,
    } as SchedulePayload;

    // Сравниваем с предыдущим payload, чтобы избежать бесконечного цикла
    const payloadStr = JSON.stringify(payload);
    if (payloadStr !== prevPayloadRef.current) {
      prevPayloadRef.current = payloadStr;
      onScheduleChange(payload);
    }
  }, [formData, schedule, onScheduleChange]);

  const handleUniformScheduleToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      uniformSchedule: checked,
    }));
  };

  const handleUniformTimeChange = (field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      uniformTime: {
        ...prev.uniformTime,
        [field]: value,
      },
    }));
  };

  const handleDayScheduleChange = (day: string, value: DayScheduleFormData) => {
    setFormData(prev => ({
      ...prev,
      weekSchedule: {
        ...prev.weekSchedule,
        [day]: value,
      },
    }));
  };

  const baseDayKey = DAYS_ORDER[0];
  const uniformErrors = (validationErrors as ValidationErrors | undefined)?.[baseDayKey];

  return (
    <div className="schedule-page__form">
      {/* Основное расписание */}
      <div className="schedule-page__form-card">
        <div className="schedule-page__toggle-row">
          <span className="schedule-page__toggle-label">Одинаковое время работы для всех дней</span>
          <AppSwitch
            checked={formData.uniformSchedule}
            onChange={handleUniformScheduleToggle}
            size="M"
          />
        </div>

        {formData.uniformSchedule && (
          <div className="schedule-page__time-row">
            <span className="schedule-page__time-label">Время работы</span>
            <div className="schedule-page__time-range-container">
              <AppTimePicker
                value={formData.uniformTime.open}
                onChange={(value) => handleUniformTimeChange('open', value)}
                placeholder="09:00"
                error={uniformErrors?.open}
              />
              <div className="schedule-page__time-separator" />
              <AppTimePicker
                value={formData.uniformTime.close}
                onChange={(value) => handleUniformTimeChange('close', value)}
                placeholder="21:00"
                error={uniformErrors?.close}
              />
            </div>
          </div>
        )}

        {!formData.uniformSchedule && (
          <div className="schedule-page__day-schedule-section">
            {DAYS_ORDER.map(day => (
              <DayScheduleRow
                key={day}
                dayName={DAY_NAMES[day] || day}
                value={formData.weekSchedule[day]}
                onChange={(value) => handleDayScheduleChange(day, value)}
                errorOpen={validationErrors[day]?.open}
                errorClose={validationErrors[day]?.close}
              />
            ))}
          </div>
        )}
      </div>

      {/* Выходные и сокращенные дни */}
      <div className="schedule-page__form-card">
        <h2 className="schedule-page__card-title">Выходные и сокращенные дни</h2>
        <div className="schedule-page__action-row">
          <span className="schedule-page__action-label">Отметить выходные дни в календаре</span>
          <AppButton
            variant="secondary"
            onlyIcon
            iconLeft={<span style={{ fontSize: '20px' }}>+</span>}
            onClick={onOpenHolidayModal}
          />
        </div>
        
        {/* Список специальных дат */}
        {formatSpecialDates() && (
          <div className="schedule-page__special-dates-list">
            {formatSpecialDates()!.map(({ month, items }) => (
              <div key={month} className="schedule-page__special-date-group">
                {items.map((item) => {
                  if (!item) return null;
                  const formattedDate = format(item.date, 'd MMMM', { locale: ru });
                  let label = '';
                  if (item.is_closed) {
                    label = 'Выходной';
                  } else {
                    label = `${formatTime(item.open_time)}—${formatTime(item.close_time)}`;
                  }
                  
                  return (
                    <div key={item.dateStr} className="schedule-page__special-date-row">
                      <div className="schedule-page__special-date-info">
                        <span className="schedule-page__special-date-label">{formattedDate}</span>
                        <span className="schedule-page__special-date-value">{label}</span>
                      </div>
                      <button
                        type="button"
                        className="schedule-page__delete-date-button"
                        onClick={() => {
                          if (item?.dateStr) {
                            onDeleteSpecialDate(item.dateStr);
                          }
                        }}
                        title="Удалить дату"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M7.5 2.5H12.5M2.5 5H17.5M15.8333 5L15.2489 13.7661C15.1613 15.0646 15.1174 15.7139 14.8333 16.2033C14.5833 16.6348 14.2059 16.9794 13.7514 17.1914C13.2350 17.4333 12.5759 17.4333 11.2577 17.4333H8.74229C7.42409 17.4333 6.76499 17.4333 6.24862 17.1914C5.79409 16.9794 5.41673 16.6348 5.16665 16.2033C4.88258 15.7139 4.83870 15.0646 4.75095 13.7661L4.16667 5M8.33333 8.75V12.9167M11.6667 8.75V12.9167"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatingHoursForm;

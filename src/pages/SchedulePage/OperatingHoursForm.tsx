import React, { useState } from 'react';
import AppSwitch from '@/components/ui/AppSwitch/AppSwitch';
import AppButton from '@/components/ui/AppButton/AppButton';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import DayScheduleRow from './DayScheduleRow';
import type { OperatingHoursResponseDto, UpdateRegularScheduleDto } from '../../../services/api-client/types.gen';
import { DAY_NAMES, DAYS_ORDER, formatTime, parseTime, validateTimeRange } from './utils';
import './SchedulePage.css';

interface OperatingHoursFormProps {
  schedule: OperatingHoursResponseDto[];
  onSave: (data: UpdateRegularScheduleDto) => Promise<void>;
  onOpenHolidayModal: () => void;
}

interface DayScheduleFormData {
  open: string;
  close: string;
  isClosed: boolean;
}

interface FormData {
  uniformSchedule: boolean;
  uniformTime: { open: string; close: string };
  weekSchedule: Record<string, DayScheduleFormData>;
}

const OperatingHoursForm: React.FC<OperatingHoursFormProps> = ({ 
  schedule, 
  onSave,
  onOpenHolidayModal 
}) => {
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.uniformSchedule) {
      if (!formData.uniformTime.open) {
        newErrors.uniform = 'Укажите время открытия';
      } else if (!formData.uniformTime.close) {
        newErrors.uniform = 'Укажите время закрытия';
      } else if (!validateTimeRange(formData.uniformTime.open, formData.uniformTime.close)) {
        newErrors.uniform = 'Время закрытия должно быть позже времени открытия';
      }
    } else {
      DAYS_ORDER.forEach(day => {
        const daySchedule = formData.weekSchedule[day];
        
        // Пропускаем валидацию для выходных дней
        if (daySchedule.isClosed) {
          return;
        }
        
        if (!daySchedule.open) {
          newErrors[day] = 'Укажите время открытия';
        } else if (!daySchedule.close) {
          newErrors[day] = 'Укажите время закрытия';
        } else if (!validateTimeRange(daySchedule.open, daySchedule.close)) {
          newErrors[day] = 'Время закрытия должно быть позже времени открытия';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      // Получаем timezone из schedule (все дни имеют одинаковый timezone)
      const timezone = schedule[0]?.timezone || 'Europe/Moscow';
      
      const updateData: Partial<Record<string, { open_time?: string; close_time?: string; is_closed: boolean }>> = {};

      if (formData.uniformSchedule) {
        const openTime = parseTime(formData.uniformTime.open);
        const closeTime = parseTime(formData.uniformTime.close);

        DAYS_ORDER.forEach(day => {
          updateData[day] = {
            open_time: openTime ? `${openTime.hour.toString().padStart(2, '0')}:${openTime.minute.toString().padStart(2, '0')}` : '',
            close_time: closeTime ? `${closeTime.hour.toString().padStart(2, '0')}:${closeTime.minute.toString().padStart(2, '0')}` : '',
            is_closed: false,
          };
        });
      } else {
        DAYS_ORDER.forEach(day => {
          const daySchedule = formData.weekSchedule[day];
          
          if (daySchedule.isClosed) {
            // Для выходных дней отправляем только is_closed: true
            updateData[day] = {
              is_closed: true,
            };
          } else {
            // Для рабочих дней устанавливаем время работы
            const openTime = parseTime(daySchedule.open);
            const closeTime = parseTime(daySchedule.close);

            updateData[day] = {
              open_time: openTime ? `${openTime.hour.toString().padStart(2, '0')}:${openTime.minute.toString().padStart(2, '0')}` : '00:00',
              close_time: closeTime ? `${closeTime.hour.toString().padStart(2, '0')}:${closeTime.minute.toString().padStart(2, '0')}` : '00:00',
              is_closed: false,
            };
          }
        });
      }

      // Добавляем timezone к payload
      const payload = {
        ...updateData,
        timezone,
      } as unknown as UpdateRegularScheduleDto;

      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="schedule-page__form">
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
            />
            <div className="schedule-page__time-separator" />
            <AppTimePicker
              value={formData.uniformTime.close}
              onChange={(value) => handleUniformTimeChange('close', value)}
              placeholder="21:00"
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
            />
          ))}
        </div>
      )}

      <div className="schedule-page__action-row">
        <span className="schedule-page__action-label">Отметить выходные дни в календаре</span>
        <AppButton
          variant="secondary"
          onlyIcon
          iconLeft={<span style={{ fontSize: '20px' }}>+</span>}
          onClick={onOpenHolidayModal}
        />
      </div>

      {/* <div className="schedule-page__action-row">
        <span className="schedule-page__action-label">Добавить сокращенный день</span>
        <AppButton
          variant="secondary"
          onlyIcon
          iconLeft={<span style={{ fontSize: '20px' }}>+</span>}
          onClick={() => console.log('Добавить сокращенный день')}
        />
      </div> */}

      {Object.keys(errors).length > 0 && (
        <div style={{ marginTop: '16px', color: '#E53E3E', fontSize: '14px' }}>
          {errors.uniform && <p style={{ margin: '4px 0' }}>{errors.uniform}</p>}
          {Object.entries(errors).filter(([key]) => key !== 'uniform').map(([day, error]) => (
            <p key={day} style={{ margin: '4px 0' }}>
              {DAY_NAMES[day]}: {error}
            </p>
          ))}
        </div>
      )}

      <div className="schedule-page__save-button">
        <AppButton
          variant="primary"
          onClick={handleSubmit}
          loading={isSaving}
          disabled={isSaving}
        >
          Сохранить
        </AppButton>
      </div>
    </div>
  );
};

export default OperatingHoursForm;

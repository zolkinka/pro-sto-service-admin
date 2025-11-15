import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useStores } from '@/hooks/useStores';
import { ROUTES } from '@/constants/routes';
import { MobileHeader } from '@/mobile-components/MobileHeader/MobileHeader';
import { MobileMenu } from '@/mobile-components/MobileMenu/MobileMenu';
import AppSwitch from '@/components/ui/AppSwitch/AppSwitch';
import MobileTimePicker from '@/mobile-components/MobileTimePicker/MobileTimePicker';
import MobileDayScheduleRow from '@/mobile-components/MobileDayScheduleRow/MobileDayScheduleRow';
import MobileSpecialDatesTable from '@/mobile-components/MobileSpecialDatesTable/MobileSpecialDatesTable';
import MobileSpecialDateModal from '@/mobile-components/MobileSpecialDateModal/MobileSpecialDateModal';
import MobileButton from '@/mobile-components/MobileButton/MobileButton';
import { DAY_NAMES, DAYS_ORDER, formatTime, parseTime, validateTimeRange } from './utils';
import type { UpdateRegularScheduleDto } from '../../../services/api-client/types.gen';
import './MobileSchedulePage.css';

interface DayScheduleFormData {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const MobileSchedulePage: React.FC = observer(() => {
  const rootStore = useStores();
  const { operatingHoursStore, authStore } = rootStore;
  const navigate = useNavigate();
  const [uniformSchedule, setUniformSchedule] = useState(true);
  const [uniformOpenTime, setUniformOpenTime] = useState('09:00');
  const [uniformCloseTime, setUniformCloseTime] = useState('18:00');
  const [weekSchedule, setWeekSchedule] = useState<Record<string, DayScheduleFormData>>({});
  const [isSpecialDateModalOpen, setIsSpecialDateModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const serviceCenterUuid = authStore.user?.service_center_uuid;
  const originalDataRef = useRef<{
    uniformSchedule: boolean;
    uniformOpenTime: string;
    uniformCloseTime: string;
    weekSchedule: Record<string, DayScheduleFormData>;
  } | null>(null);

  // Инициализация данных
  useEffect(() => {
    if (!serviceCenterUuid) return;
    
    operatingHoursStore.loadOperatingHours(serviceCenterUuid);
    
    return () => {
      operatingHoursStore.reset();
    };
  }, [operatingHoursStore, serviceCenterUuid]);

  // Инициализация формы из store
  useEffect(() => {
    if (operatingHoursStore.regularSchedule.length === 0) return;

    // Проверяем, одинаковое ли время для всех дней
    const firstDay = operatingHoursStore.regularSchedule[0];
    const allSameTime = operatingHoursStore.regularSchedule.every(day => {
      if (day.is_closed !== firstDay.is_closed) return false;
      if (day.is_closed) return true;
      
      return (
        formatTime(day.open_time) === formatTime(firstDay.open_time) &&
        formatTime(day.close_time) === formatTime(firstDay.close_time)
      );
    });

    const uniformOpen = formatTime(firstDay.open_time);
    const uniformClose = formatTime(firstDay.close_time);

    setUniformSchedule(allSameTime);

    if (allSameTime && !firstDay.is_closed) {
      setUniformOpenTime(uniformOpen);
      setUniformCloseTime(uniformClose);
    }

    // Инициализация недельного расписания
    const schedule: Record<string, DayScheduleFormData> = {};
    operatingHoursStore.regularSchedule.forEach(day => {
      if (day.day_of_week) {
        schedule[day.day_of_week] = {
          isOpen: !day.is_closed,
          openTime: formatTime(day.open_time) || '09:00',
          closeTime: formatTime(day.close_time) || '18:00',
        };
      }
    });
    setWeekSchedule(schedule);

    // Сохраняем оригинальные данные для отслеживания изменений
    originalDataRef.current = {
      uniformSchedule: allSameTime,
      uniformOpenTime: uniformOpen,
      uniformCloseTime: uniformClose,
      weekSchedule: JSON.parse(JSON.stringify(schedule)),
    };
    
    // Сбрасываем флаг изменений при загрузке новых данных
    setHasUnsavedChanges(false);
  }, [operatingHoursStore.regularSchedule]);

  // Отслеживание изменений
  useEffect(() => {
    if (!originalDataRef.current) return;

    const original = originalDataRef.current;
    const hasChanges = 
      uniformSchedule !== original.uniformSchedule ||
      uniformOpenTime !== original.uniformOpenTime ||
      uniformCloseTime !== original.uniformCloseTime ||
      JSON.stringify(weekSchedule) !== JSON.stringify(original.weekSchedule);

    setHasUnsavedChanges(hasChanges);
  }, [uniformSchedule, uniformOpenTime, uniformCloseTime, weekSchedule]);

  // Валидация данных
  const validate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (uniformSchedule) {
      if (!uniformOpenTime) {
        errors.push('Укажите время открытия');
      } else if (!uniformCloseTime) {
        errors.push('Укажите время закрытия');
      } else if (!validateTimeRange(uniformOpenTime, uniformCloseTime)) {
        errors.push('Время закрытия должно быть позже времени открытия');
      }
    } else {
      DAYS_ORDER.forEach(day => {
        const daySchedule = weekSchedule[day];
        
        if (!daySchedule) return;
        if (daySchedule.isOpen === false) return;
        
        if (!daySchedule.openTime) {
          errors.push(`${DAY_NAMES[day]}: укажите время открытия`);
        } else if (!daySchedule.closeTime) {
          errors.push(`${DAY_NAMES[day]}: укажите время закрытия`);
        } else if (!validateTimeRange(daySchedule.openTime, daySchedule.closeTime)) {
          errors.push(`${DAY_NAMES[day]}: время закрытия должно быть позже времени открытия`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  };

  // Обработчик сохранения
  const handleSave = async () => {
    if (!serviceCenterUuid) return;

    const validation = validate();
    if (!validation.isValid) {
      rootStore.toastStore.showError(
        validation.errors.join('. ')
      );
      return;
    }

    setIsSaving(true);

    try {
      const timezone = operatingHoursStore.timezone || 'Europe/Moscow';
      const updateData: Record<string, { open_time?: string; close_time?: string; is_closed: boolean }> = {};

      if (uniformSchedule) {
        const openTime = parseTime(uniformOpenTime);
        const closeTime = parseTime(uniformCloseTime);

        DAYS_ORDER.forEach(day => {
          updateData[day] = {
            open_time: openTime ? `${openTime.hour.toString().padStart(2, '0')}:${openTime.minute.toString().padStart(2, '0')}` : '',
            close_time: closeTime ? `${closeTime.hour.toString().padStart(2, '0')}:${closeTime.minute.toString().padStart(2, '0')}` : '',
            is_closed: false,
          };
        });
      } else {
        DAYS_ORDER.forEach(day => {
          const daySchedule = weekSchedule[day];
          
          if (!daySchedule || !daySchedule.isOpen) {
            updateData[day] = { is_closed: true };
          } else {
            const openTime = parseTime(daySchedule.openTime);
            const closeTime = parseTime(daySchedule.closeTime);

            updateData[day] = {
              open_time: openTime ? `${openTime.hour.toString().padStart(2, '0')}:${openTime.minute.toString().padStart(2, '0')}` : '00:00',
              close_time: closeTime ? `${closeTime.hour.toString().padStart(2, '0')}:${closeTime.minute.toString().padStart(2, '0')}` : '00:00',
              is_closed: false,
            };
          }
        });
      }

      const payload = {
        ...updateData,
        timezone,
      } as unknown as UpdateRegularScheduleDto;

      await operatingHoursStore.updateRegularSchedule(serviceCenterUuid, payload);
      
      // Обновляем оригинальные данные после успешного сохранения
      originalDataRef.current = {
        uniformSchedule,
        uniformOpenTime,
        uniformCloseTime,
        weekSchedule: JSON.parse(JSON.stringify(weekSchedule)),
      };
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчики изменений
  const handleUniformScheduleChange = (checked: boolean) => {
    setUniformSchedule(checked);
  };

  const handleUniformOpenTimeChange = (time: string) => {
    setUniformOpenTime(time);
  };

  const handleUniformCloseTimeChange = (time: string) => {
    setUniformCloseTime(time);
  };

  const handleDayToggle = (day: string, isOpen: boolean) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen,
      },
    }));
  };

  const handleDayOpenTimeChange = (day: string, time: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        openTime: time,
      },
    }));
  };

  const handleDayCloseTimeChange = (day: string, time: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closeTime: time,
      },
    }));
  };

  const handleOpenSpecialDateModal = () => {
    setIsSpecialDateModalOpen(true);
  };

  const handleCloseSpecialDateModal = () => {
    setIsSpecialDateModalOpen(false);
  };

  const handleSaveSpecialDate = async (
    date: Date,
    isClosed: boolean,
    openTime?: string,
    closeTime?: string
  ) => {
    if (!serviceCenterUuid) return;

    const formattedDate = format(date, 'yyyy-MM-dd');

    await operatingHoursStore.createSpecialDate(serviceCenterUuid, {
      specific_date: formattedDate,
      is_closed: isClosed,
      open_time: !isClosed && openTime ? openTime : undefined,
      close_time: !isClosed && closeTime ? closeTime : undefined,
      timezone: operatingHoursStore.timezone,
    });
  };

  const handleDeleteSpecialDate = async (uuid: string) => {
    if (!serviceCenterUuid) return;
    
    await operatingHoursStore.deleteSpecialDate(serviceCenterUuid, uuid);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNotificationClick = () => {
    navigate(ROUTES.NOTIFICATIONS);
  };

  if (!serviceCenterUuid) {
    return (
      <div className="mobile-schedule-page">
        <MobileHeader onMenuClick={handleMenuClick} onNotificationClick={handleNotificationClick} isMenuOpen={isMenuOpen} />
        <div className="mobile-schedule-page__container">
          <h1 className="mobile-schedule-page__title">Время работы</h1>
          <p>Не удалось определить сервисный центр</p>
        </div>
      </div>
    );
  }

  if (operatingHoursStore.loading && operatingHoursStore.regularSchedule.length === 0) {
    return (
      <div className="mobile-schedule-page">
        <MobileHeader onMenuClick={handleMenuClick} onNotificationClick={handleNotificationClick} isMenuOpen={isMenuOpen} />
        <div className="mobile-schedule-page__container">
          <h1 className="mobile-schedule-page__title">Время работы</h1>
          <div className="mobile-schedule-page__loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  const existingSpecialDates = operatingHoursStore.specialDates
    .filter(d => d.specific_date)
    .map(d => new Date(d.specific_date!));

  return (
    <div className="mobile-schedule-page">
      <MobileHeader onMenuClick={handleMenuClick} onNotificationClick={handleNotificationClick} isMenuOpen={isMenuOpen} />
      
      <div className="mobile-schedule-page__container">
        <h1 className="mobile-schedule-page__title">Время работы</h1>
        
        <div className="mobile-schedule-page__card">
          <div className="mobile-schedule-page__uniform-toggle">
            <span className="mobile-schedule-page__uniform-label">
              Одинаковое время для всех дней
            </span>
            <AppSwitch
              checked={uniformSchedule}
              onChange={handleUniformScheduleChange}
              size="L"
            />
          </div>

          {uniformSchedule ? (
            <div className="mobile-schedule-page__uniform-times">
              <label className="mobile-schedule-page__field-label">Время работы</label>
              <div className="mobile-schedule-page__time-row">
                <MobileTimePicker
                  value={uniformOpenTime}
                  onChange={handleUniformOpenTimeChange}
                />
                <div className="mobile-schedule-page__time-separator" />
                <MobileTimePicker
                  value={uniformCloseTime}
                  onChange={handleUniformCloseTimeChange}
                />
              </div>
            </div>
          ) : (
            <div className="mobile-schedule-page__week-schedule">
              {DAYS_ORDER.map(day => {
                const dayData = weekSchedule[day] || { isOpen: true, openTime: '09:00', closeTime: '18:00' };
                
                return (
                  <MobileDayScheduleRow
                    key={day}
                    dayName={DAY_NAMES[day]}
                    isOpen={dayData.isOpen}
                    openTime={dayData.openTime}
                    closeTime={dayData.closeTime}
                    onToggle={(isOpen) => handleDayToggle(day, isOpen)}
                    onOpenTimeChange={(time) => handleDayOpenTimeChange(day, time)}
                    onCloseTimeChange={(time) => handleDayCloseTimeChange(day, time)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="mobile-schedule-page__card">
          <h2 className="mobile-schedule-page__section-title">
            Выходные и сокращенные дни
          </h2>
          
          <MobileSpecialDatesTable
            specialDates={operatingHoursStore.specialDates}
            onDelete={handleDeleteSpecialDate}
          />
          
          <button
            className="mobile-schedule-page__add-button"
            onClick={handleOpenSpecialDateModal}
            type="button"
          >
            <span>Добавить день</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <MobileSpecialDateModal
        isOpen={isSpecialDateModalOpen}
        onClose={handleCloseSpecialDateModal}
        onSave={handleSaveSpecialDate}
        existingDates={existingSpecialDates}
      />

      {hasUnsavedChanges && (
        <div className="mobile-schedule-page__save-button-container">
          <MobileButton
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving}
            fullWidth
          >
            Сохранить
          </MobileButton>
        </div>
      )}

      <MobileMenu isOpen={isMenuOpen} onClose={handleMenuClose} />
    </div>
  );
});

export default MobileSchedulePage;

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useStores } from '@/hooks/useStores';
import { ROUTES } from '@/constants/routes';
import { MobileHeader } from '@/mobile-components/MobileHeader/MobileHeader';
import AppSwitch from '@/components/ui/AppSwitch/AppSwitch';
import MobileTimePicker from '@/mobile-components/MobileTimePicker/MobileTimePicker';
import MobileDayScheduleRow from '@/mobile-components/MobileDayScheduleRow/MobileDayScheduleRow';
import MobileSpecialDatesTable from '@/mobile-components/MobileSpecialDatesTable/MobileSpecialDatesTable';
import MobileSpecialDateModal from '@/mobile-components/MobileSpecialDateModal/MobileSpecialDateModal';
import { DAY_NAMES, DAYS_ORDER, formatTime } from './utils';
import type { UpdateRegularScheduleDto } from '../../../services/api-client/types.gen';
import './MobileSchedulePage.css';

interface DayScheduleFormData {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const MobileSchedulePage: React.FC = observer(() => {
  const { operatingHoursStore, authStore } = useStores();
  const navigate = useNavigate();
  const [uniformSchedule, setUniformSchedule] = useState(true);
  const [uniformOpenTime, setUniformOpenTime] = useState('09:00');
  const [uniformCloseTime, setUniformCloseTime] = useState('18:00');
  const [weekSchedule, setWeekSchedule] = useState<Record<string, DayScheduleFormData>>({});
  const [isSpecialDateModalOpen, setIsSpecialDateModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const serviceCenterUuid = authStore.user?.service_center_uuid;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    setUniformSchedule(allSameTime);

    if (allSameTime && !firstDay.is_closed) {
      setUniformOpenTime(formatTime(firstDay.open_time));
      setUniformCloseTime(formatTime(firstDay.close_time));
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
  }, [operatingHoursStore.regularSchedule]);

  // Автосохранение с дебаунсом
  const saveSchedule = useCallback(async () => {
    if (!serviceCenterUuid) return;

    const updateData: UpdateRegularScheduleDto = {
      monday: uniformSchedule 
        ? { is_closed: false, open_time: uniformOpenTime, close_time: uniformCloseTime }
        : weekSchedule.monday 
          ? { is_closed: !weekSchedule.monday.isOpen, open_time: weekSchedule.monday.isOpen ? weekSchedule.monday.openTime : undefined, close_time: weekSchedule.monday.isOpen ? weekSchedule.monday.closeTime : undefined }
          : { is_closed: true },
      tuesday: uniformSchedule 
        ? { is_closed: false, open_time: uniformOpenTime, close_time: uniformCloseTime }
        : weekSchedule.tuesday 
          ? { is_closed: !weekSchedule.tuesday.isOpen, open_time: weekSchedule.tuesday.isOpen ? weekSchedule.tuesday.openTime : undefined, close_time: weekSchedule.tuesday.isOpen ? weekSchedule.tuesday.closeTime : undefined }
          : { is_closed: true },
      wednesday: uniformSchedule 
        ? { is_closed: false, open_time: uniformOpenTime, close_time: uniformCloseTime }
        : weekSchedule.wednesday 
          ? { is_closed: !weekSchedule.wednesday.isOpen, open_time: weekSchedule.wednesday.isOpen ? weekSchedule.wednesday.openTime : undefined, close_time: weekSchedule.wednesday.isOpen ? weekSchedule.wednesday.closeTime : undefined }
          : { is_closed: true },
      thursday: uniformSchedule 
        ? { is_closed: false, open_time: uniformOpenTime, close_time: uniformCloseTime }
        : weekSchedule.thursday 
          ? { is_closed: !weekSchedule.thursday.isOpen, open_time: weekSchedule.thursday.isOpen ? weekSchedule.thursday.openTime : undefined, close_time: weekSchedule.thursday.isOpen ? weekSchedule.thursday.closeTime : undefined }
          : { is_closed: true },
      friday: uniformSchedule 
        ? { is_closed: false, open_time: uniformOpenTime, close_time: uniformCloseTime }
        : weekSchedule.friday 
          ? { is_closed: !weekSchedule.friday.isOpen, open_time: weekSchedule.friday.isOpen ? weekSchedule.friday.openTime : undefined, close_time: weekSchedule.friday.isOpen ? weekSchedule.friday.closeTime : undefined }
          : { is_closed: true },
      saturday: uniformSchedule 
        ? { is_closed: false, open_time: uniformOpenTime, close_time: uniformCloseTime }
        : weekSchedule.saturday 
          ? { is_closed: !weekSchedule.saturday.isOpen, open_time: weekSchedule.saturday.isOpen ? weekSchedule.saturday.openTime : undefined, close_time: weekSchedule.saturday.isOpen ? weekSchedule.saturday.closeTime : undefined }
          : { is_closed: true },
      sunday: uniformSchedule 
        ? { is_closed: false, open_time: uniformOpenTime, close_time: uniformCloseTime }
        : weekSchedule.sunday 
          ? { is_closed: !weekSchedule.sunday.isOpen, open_time: weekSchedule.sunday.isOpen ? weekSchedule.sunday.openTime : undefined, close_time: weekSchedule.sunday.isOpen ? weekSchedule.sunday.closeTime : undefined }
          : { is_closed: true },
      timezone: operatingHoursStore.timezone,
    };

    try {
      await operatingHoursStore.updateRegularSchedule(serviceCenterUuid, updateData);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  }, [serviceCenterUuid, uniformSchedule, uniformOpenTime, uniformCloseTime, weekSchedule, operatingHoursStore]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveSchedule();
    }, 1000);
  }, [saveSchedule]);

  // Обработчики изменений
  const handleUniformScheduleChange = (checked: boolean) => {
    setUniformSchedule(checked);
    debouncedSave();
  };

  const handleUniformOpenTimeChange = (time: string) => {
    setUniformOpenTime(time);
    debouncedSave();
  };

  const handleUniformCloseTimeChange = (time: string) => {
    setUniformCloseTime(time);
    debouncedSave();
  };

  const handleDayToggle = (day: string, isOpen: boolean) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen,
      },
    }));
    debouncedSave();
  };

  const handleDayOpenTimeChange = (day: string, time: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        openTime: time,
      },
    }));
    debouncedSave();
  };

  const handleDayCloseTimeChange = (day: string, time: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closeTime: time,
      },
    }));
    debouncedSave();
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
    </div>
  );
});

export default MobileSchedulePage;

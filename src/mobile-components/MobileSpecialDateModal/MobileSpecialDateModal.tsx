import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { AppBaseDropdown } from '@/components/ui/AppBaseDropdown';
import MobileTimePicker from '../MobileTimePicker/MobileTimePicker';
import { validateTimeRange } from '../../pages/SchedulePage/utils';
import './MobileSpecialDateModal.css';

export interface MobileSpecialDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: Date, isClosed: boolean, openTime?: string, closeTime?: string) => Promise<void>;
  existingDates: Date[];
  'data-testid'?: string;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

type DayType = 'holiday' | 'shortened';

const MobileSpecialDateModal: React.FC<MobileSpecialDateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingDates,
  'data-testid': dataTestId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayType, setDayType] = useState<DayType>('holiday');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Сброс состояния при открытии
      setSelectedDate(null);
      setDayType('holiday');
      setOpenTime('09:00');
      setCloseTime('18:00');
      setError('');
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = getDay(monthStart);
  const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setError('');
  };

  const handleDayTypeChange = (type: DayType) => {
    setDayType(type);
    setIsTypeDropdownOpen(false);
    setError('');
  };

  const handleTypeDropdownClose = () => {
    setIsTypeDropdownOpen(false);
  };

  const isValidTimeSlot = (time: string): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;
    
    // Проверяем кратность 15 минутам
    return minutes % 15 === 0;
  };

  const handleSave = async () => {
    // Валидация
    if (!selectedDate) {
      setError('Выберите дату');
      return;
    }

    // Проверка что дата не существует
    const dateExists = existingDates.some(d => isSameDay(d, selectedDate));
    if (dateExists) {
      setError('Эта дата уже добавлена');
      return;
    }

    if (dayType === 'shortened') {
      if (!openTime || !closeTime) {
        setError('Заполните время работы');
        return;
      }

      // Валидация времени на кратность 15 минутам
      if (!isValidTimeSlot(openTime)) {
        setError('Время открытия должно быть кратно 15 минутам (например: 09:00, 09:15, 09:30, 09:45)');
        return;
      }

      if (!isValidTimeSlot(closeTime)) {
        setError('Время закрытия должно быть кратно 15 минутам (например: 18:00, 18:15, 18:30, 18:45)');
        return;
      }

      if (!validateTimeRange(openTime, closeTime)) {
        setError('Время закрытия должно быть позже времени открытия');
        return;
      }
    }

    setIsSaving(true);
    try {
      const isClosed = dayType === 'holiday';
      await onSave(
        selectedDate,
        isClosed,
        dayType === 'shortened' ? openTime : undefined,
        dayType === 'shortened' ? closeTime : undefined
      );
      onClose();
    } catch (error) {
      console.error('Failed to save special date:', error);
      setError('Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <div className="mobile-special-date-modal" data-testid={dataTestId}>
      <div className="mobile-special-date-modal__backdrop" onClick={handleClose} />
      
      <div className="mobile-special-date-modal__content">
        <div className="mobile-special-date-modal__handle" />
        
        <div className="mobile-special-date-modal__body">
          {/* Календарь */}
          <div className="mobile-special-date-modal__calendar">
            <div className="mobile-special-date-modal__calendar-header">
              <button
                className="mobile-special-date-modal__nav-button"
                onClick={handlePrevMonth}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="mobile-special-date-modal__calendar-month">
                {format(currentDate, 'LLLL yyyy', { locale: ru })}
              </span>
              <button
                className="mobile-special-date-modal__nav-button"
                onClick={handleNextMonth}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="mobile-special-date-modal__calendar-weekdays">
              {WEEKDAYS.map(day => (
                <div key={day} className="mobile-special-date-modal__calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="mobile-special-date-modal__calendar-days">
              {Array.from({ length: emptyDays }).map((_, index) => (
                <div key={`empty-${index}`} className="mobile-special-date-modal__calendar-day mobile-special-date-modal__calendar-day_empty" />
              ))}
              
              {days.map(day => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={day.toISOString()}
                    className={`mobile-special-date-modal__calendar-day ${
                      isSelected ? 'mobile-special-date-modal__calendar-day_selected' : ''
                    } ${
                      isToday ? 'mobile-special-date-modal__calendar-day_today' : ''
                    } ${
                      !isCurrentMonth ? 'mobile-special-date-modal__calendar-day_other-month' : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                    type="button"
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Тип дня */}
          <div className="mobile-special-date-modal__section">
            <div className="mobile-special-date-modal__field">
              <label className="mobile-special-date-modal__label">Тип дня</label>
              <AppBaseDropdown
                opened={isTypeDropdownOpen}
                onClose={handleTypeDropdownClose}
                dropdownWidth="equal-toggle"
                yDirection="free-space"
                xDirection="left"
                toggle={
                  <button
                    className="mobile-special-date-modal__dropdown-button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    type="button"
                  >
                    <span>{dayType === 'holiday' ? 'Выходной' : 'Сокращенный'}</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 8.33334L10 13.3333L15 8.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                }
                dropdown={
                  <div className="mobile-special-date-modal__dropdown-menu">
                    <button
                      className="mobile-special-date-modal__dropdown-option"
                      onClick={() => handleDayTypeChange('holiday')}
                      type="button"
                    >
                      Выходной
                    </button>
                    <button
                      className="mobile-special-date-modal__dropdown-option"
                      onClick={() => handleDayTypeChange('shortened')}
                      type="button"
                    >
                      Сокращенный
                    </button>
                  </div>
                }
              />
            </div>
          </div>

          {/* Время работы для сокращенного дня */}
          {dayType === 'shortened' && (
            <div className="mobile-special-date-modal__section">
              <div className="mobile-special-date-modal__times">
                <MobileTimePicker
                  label="Время работы"
                  value={openTime}
                  onChange={setOpenTime}
                />
                <div className="mobile-special-date-modal__times-separator" />
                <MobileTimePicker
                  label="&nbsp;"
                  value={closeTime}
                  onChange={setCloseTime}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mobile-special-date-modal__error">
              {error}
            </div>
          )}
        </div>

        <div className="mobile-special-date-modal__divider" />

        <div className="mobile-special-date-modal__footer">
          <button
            className="mobile-special-date-modal__button mobile-special-date-modal__button_cancel"
            onClick={handleClose}
            disabled={isSaving}
            type="button"
          >
            Отмена
          </button>
          <button
            className="mobile-special-date-modal__button mobile-special-date-modal__button_save"
            onClick={handleSave}
            disabled={isSaving}
            type="button"
          >
            {isSaving ? 'Сохранение...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSpecialDateModal;

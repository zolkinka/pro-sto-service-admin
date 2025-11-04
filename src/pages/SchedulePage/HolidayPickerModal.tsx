import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import AppButton from '@/components/ui/AppButton/AppButton';
import './HolidayPickerModal.css';

interface HolidayPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dates: Date[]) => Promise<void>;
  existingHolidays?: Date[];
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const HolidayPickerModal: React.FC<HolidayPickerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingHolidays = [],
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>(existingHolidays);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    // Блокируем скролл при открытии модалки
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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

  // Добавляем пустые ячейки в начале для выравнивания дней недели
  const firstDayOfWeek = getDay(monthStart);
  const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (day: Date) => {
    const isSelected = selectedDates.some(d => isSameDay(d, day));
    
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, day)));
    } else {
      setSelectedDates([...selectedDates, day]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedDates);
      onClose();
    } catch (error) {
      console.error('Failed to save holidays:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedDates(existingHolidays);
    onClose();
  };

  return (
    <div className="holiday-picker-modal">
      <div className="holiday-picker-modal__backdrop" onClick={handleClose} />
      <div className="holiday-picker-modal__content">
        <div className="holiday-picker-modal__header">
          <h2 className="holiday-picker-modal__title">Отметить выходные дни</h2>
          <button 
            className="holiday-picker-modal__close" 
            onClick={handleClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="holiday-picker-modal__body">
          <div className="holiday-picker-calendar">
            <div className="holiday-picker-calendar__header">
              <button
                className="holiday-picker-calendar__nav-button"
                onClick={handlePrevMonth}
                aria-label="Предыдущий месяц"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="holiday-picker-calendar__month">
                {format(currentDate, 'LLLL yyyy', { locale: ru })}
              </span>
              <button
                className="holiday-picker-calendar__nav-button"
                onClick={handleNextMonth}
                aria-label="Следующий месяц"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="holiday-picker-calendar__weekdays">
              {WEEKDAYS.map(day => (
                <div key={day} className="holiday-picker-calendar__weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="holiday-picker-calendar__days">
              {Array.from({ length: emptyDays }).map((_, index) => (
                <div key={`empty-${index}`} className="holiday-picker-calendar__day holiday-picker-calendar__day_empty" />
              ))}
              
              {days.map(day => {
                const isSelected = selectedDates.some(d => isSameDay(d, day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    className={`holiday-picker-calendar__day ${
                      isSelected ? 'holiday-picker-calendar__day_selected' : ''
                    } ${
                      !isCurrentMonth ? 'holiday-picker-calendar__day_other-month' : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="holiday-picker-modal__footer">
          <AppButton
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            Отмена
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving}
          >
            Добавить
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default HolidayPickerModal;

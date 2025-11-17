import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import AppButton from '@/components/ui/AppButton/AppButton';
import { AppSingleSelect } from '@/components/ui/AppSingleSelect/AppSingleSelect';
import type { SelectOption } from '@/components/ui/AppSingleSelect/AppSingleSelect.types';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import './SpecialDateModal.css';

export interface SpecialDateData {
  date: Date;
  isHoliday: boolean;
  openTime?: string;
  closeTime?: string;
}

interface SpecialDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SpecialDateData) => void;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const DAY_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Выходной', value: 'holiday' },
  { label: 'Сокращенный день', value: 'shortened' },
];

const SpecialDateModal: React.FC<SpecialDateModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayType, setDayType] = useState<'holiday' | 'shortened'>('holiday');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Сбрасываем состояние при открытии
      setSelectedDate(null);
      setDayType('holiday');
      setOpenTime('09:00');
      setCloseTime('18:00');
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
  };

  const handleSave = () => {
    if (!selectedDate) return;

    onSave({
      date: selectedDate,
      isHoliday: dayType === 'holiday',
      openTime: dayType === 'shortened' ? openTime : undefined,
      closeTime: dayType === 'shortened' ? closeTime : undefined,
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="special-date-modal">
      <div className="special-date-modal__backdrop" onClick={handleClose} />
      <div className="special-date-modal__content">
        <div className="special-date-modal__header">
          <h2 className="special-date-modal__title">Добавить специальную дату</h2>
          <button 
            className="special-date-modal__close" 
            onClick={handleClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="special-date-modal__body">
          {/* Календарь */}
          <div className="special-date-modal__section">
            <div className="special-date-calendar">
              <div className="special-date-calendar__header">
                <button
                  className="special-date-calendar__nav-button"
                  onClick={handlePrevMonth}
                  aria-label="Предыдущий месяц"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="special-date-calendar__month">
                  {format(currentDate, 'LLLL yyyy', { locale: ru })}
                </span>
                <button
                  className="special-date-calendar__nav-button"
                  onClick={handleNextMonth}
                  aria-label="Следующий месяц"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="special-date-calendar__weekdays">
                {WEEKDAYS.map(day => (
                  <div key={day} className="special-date-calendar__weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="special-date-calendar__days">
                {Array.from({ length: emptyDays }).map((_, index) => (
                  <div key={`empty-${index}`} className="special-date-calendar__day special-date-calendar__day_empty" />
                ))}
                
                {days.map(day => {
                  const isSelected = selectedDate && isSameDay(selectedDate, day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <button
                      key={day.toISOString()}
                      className={`special-date-calendar__day ${
                        isSelected ? 'special-date-calendar__day_selected' : ''
                      } ${
                        !isCurrentMonth ? 'special-date-calendar__day_other-month' : ''
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

          {/* Тип дня и время работы */}
          <div className="special-date-modal__section">
            <div className="special-date-modal__form">
              {/* Тип дня */}
              <div className="special-date-modal__field">
                <AppSingleSelect
                  label="Тип дня"
                  options={DAY_TYPE_OPTIONS}
                  value={DAY_TYPE_OPTIONS.find(opt => opt.value === dayType) || null}
                  onChange={(option) => setDayType(option?.value as 'holiday' | 'shortened' || 'holiday')}
                />
              </div>

              {/* Время работы - показываем только для сокращенного дня */}
              {dayType === 'shortened' && (
                <div className="special-date-modal__time-fields">
                  <div className="special-date-modal__field">
                    <label className="special-date-modal__label">Время работы</label>
                    <div className="special-date-modal__time-inputs">
                      <AppTimePicker
                        value={openTime}
                        onChange={setOpenTime}
                        placeholder="09:00"
                      />

                      <span className="special-date-modal__time-separator">—</span>

                      <AppTimePicker
                        value={closeTime}
                        onChange={setCloseTime}
                        placeholder="18:00"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="special-date-modal__footer">
          <AppButton
            variant="secondary"
            onClick={handleClose}
          >
            Отмена
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSave}
            disabled={!selectedDate}
          >
            Добавить
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default SpecialDateModal;

import React from 'react';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import AppSwitch from '@/components/ui/AppSwitch/AppSwitch';
import './SchedulePage.css';

interface DayScheduleRowProps {
  dayName: string;
  value: { open: string; close: string; isClosed: boolean };
  onChange: (value: { open: string; close: string; isClosed: boolean }) => void;
}

const DayScheduleRow: React.FC<DayScheduleRowProps> = ({ dayName, value, onChange }) => {
  const handleOpenTimeChange = (time: string) => {
    onChange({ ...value, open: time });
  };

  const handleCloseTimeChange = (time: string) => {
    onChange({ ...value, close: time });
  };

  const handleWorkingDayToggle = (checked: boolean) => {
    onChange({ ...value, isClosed: !checked });
  };

  return (
    <div className="schedule-page__day-row">
      <span className="schedule-page__day-name">{dayName}</span>
      <div className="schedule-page__day-controls">
        <AppSwitch
          checked={!value.isClosed}
          onChange={handleWorkingDayToggle}
          size="M"
        />
        {value.isClosed ? (
          <span className="schedule-page__day-closed-label">Выходной</span>
        ) : (
          <div className="schedule-page__time-range-container">
            <AppTimePicker
              value={value.open}
              onChange={handleOpenTimeChange}
              placeholder="Открытие"
            />
            <div className="schedule-page__time-separator" />
            <AppTimePicker
              value={value.close}
              onChange={handleCloseTimeChange}
              placeholder="Закрытие"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DayScheduleRow;

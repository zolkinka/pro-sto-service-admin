import React from 'react';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import * as S from './SchedulePage.styles';

interface DayScheduleRowProps {
  dayName: string;
  value: { open: string; close: string; is_closed: boolean };
  onChange: (value: { open: string; close: string; is_closed: boolean }) => void;
}

const DayScheduleRow: React.FC<DayScheduleRowProps> = ({ dayName, value, onChange }) => {
  const handleOpenTimeChange = (time: string) => {
    onChange({ ...value, open: time });
  };

  const handleCloseTimeChange = (time: string) => {
    onChange({ ...value, close: time });
  };

  const handleClosedToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, is_closed: event.target.checked });
  };

  return (
    <S.DayRow>
      <S.DayName>{dayName}</S.DayName>
      <S.TimeRangeContainer>
        <AppTimePicker
          value={value.open}
          onChange={handleOpenTimeChange}
          disabled={value.is_closed}
          placeholder="Открытие"
        />
        <S.TimeSeparator />
        <AppTimePicker
          value={value.close}
          onChange={handleCloseTimeChange}
          disabled={value.is_closed}
          placeholder="Закрытие"
        />
      </S.TimeRangeContainer>
      <S.CheckboxWrapper>
        <input
          type="checkbox"
          checked={value.is_closed}
          onChange={handleClosedToggle}
        />
        Выходной
      </S.CheckboxWrapper>
    </S.DayRow>
  );
};

export default DayScheduleRow;

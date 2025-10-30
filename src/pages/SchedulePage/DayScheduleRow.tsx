import React from 'react';
import AppTimePicker from '@/components/ui/AppTimePicker/AppTimePicker';
import * as S from './SchedulePage.styles';

interface DayScheduleRowProps {
  dayName: string;
  value: { open: string; close: string };
  onChange: (value: { open: string; close: string }) => void;
}

const DayScheduleRow: React.FC<DayScheduleRowProps> = ({ dayName, value, onChange }) => {
  const handleOpenTimeChange = (time: string) => {
    onChange({ ...value, open: time });
  };

  const handleCloseTimeChange = (time: string) => {
    onChange({ ...value, close: time });
  };

  return (
    <S.DayRow>
      <S.DayName>{dayName}</S.DayName>
      <S.TimeRangeContainer>
        <AppTimePicker
          value={value.open}
          onChange={handleOpenTimeChange}
          placeholder="Открытие"
        />
        <S.TimeSeparator />
        <AppTimePicker
          value={value.close}
          onChange={handleCloseTimeChange}
          placeholder="Закрытие"
        />
      </S.TimeRangeContainer>
    </S.DayRow>
  );
};

export default DayScheduleRow;

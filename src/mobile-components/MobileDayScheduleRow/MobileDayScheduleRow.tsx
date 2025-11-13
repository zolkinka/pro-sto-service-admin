import React from 'react';
import MobileCheckbox from '../MobileCheckbox/MobileCheckbox';
import MobileTimePicker from '../MobileTimePicker/MobileTimePicker';
import './MobileDayScheduleRow.css';

export interface MobileDayScheduleRowProps {
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  onToggle: (isOpen: boolean) => void;
  onOpenTimeChange: (time: string) => void;
  onCloseTimeChange: (time: string) => void;
  'data-testid'?: string;
}

const MobileDayScheduleRow: React.FC<MobileDayScheduleRowProps> = ({
  dayName,
  isOpen,
  openTime,
  closeTime,
  onToggle,
  onOpenTimeChange,
  onCloseTimeChange,
  'data-testid': dataTestId,
}) => {
  return (
    <div className="mobile-day-schedule-row" data-testid={dataTestId}>
      <div className="mobile-day-schedule-row__header">
        <MobileCheckbox
          checked={isOpen}
          onChange={onToggle}
          data-testid={`${dataTestId}-checkbox`}
        />
        <span className="mobile-day-schedule-row__day-name">{dayName}</span>
      </div>
      
      <div className="mobile-day-schedule-row__times">
        <MobileTimePicker
          value={openTime}
          onChange={onOpenTimeChange}
          disabled={!isOpen}
          data-testid={`${dataTestId}-open-time`}
        />
        
        <div className="mobile-day-schedule-row__separator" />
        
        <MobileTimePicker
          value={closeTime}
          onChange={onCloseTimeChange}
          disabled={!isOpen}
          data-testid={`${dataTestId}-close-time`}
        />
      </div>
    </div>
  );
};

export default MobileDayScheduleRow;

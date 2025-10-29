import React from 'react';
import AppButton from '@/components/ui/AppButton/AppButton';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';
import { hasUniformSchedule, formatTime, groupDaysBySchedule, formatDaysRange } from './utils';
import * as S from './SchedulePage.styles';

interface OperatingHoursViewProps {
  schedule: OperatingHoursResponseDto[];
  onEdit: () => void;
}

const OperatingHoursView: React.FC<OperatingHoursViewProps> = ({ schedule, onEdit }) => {
  const isUniform = hasUniformSchedule(schedule);

  if (isUniform && schedule.length > 0) {
    const firstDay = schedule[0];
    const openTime = formatTime(firstDay.open_time);
    const closeTime = formatTime(firstDay.close_time);

    return (
      <S.ViewContainer>
        <S.HoursInfo>
          <S.HoursPrimary>
            {firstDay.is_closed ? 'Выходной' : `Пн—Вс ${openTime}—${closeTime}`}
          </S.HoursPrimary>
        </S.HoursInfo>
        <AppButton size="M" variant="secondary" onClick={onEdit}>
          Редактировать
        </AppButton>
      </S.ViewContainer>
    );
  }

  const groups = groupDaysBySchedule(schedule);

  return (
    <div>
      <S.ViewContainer style={{ marginBottom: '16px' }}>
        <S.HoursInfo>
          {groups.map((group, index) => (
            <div key={index} style={{ marginBottom: index < groups.length - 1 ? '8px' : '0' }}>
              <S.HoursPrimary>
                {formatDaysRange(group.days)}{' '}
                {group.isClosed ? 'Выходной' : `${group.openTime}—${group.closeTime}`}
              </S.HoursPrimary>
            </div>
          ))}
        </S.HoursInfo>
        <AppButton size="M" variant="secondary" onClick={onEdit}>
          Редактировать
        </AppButton>
      </S.ViewContainer>
    </div>
  );
};

export default OperatingHoursView;

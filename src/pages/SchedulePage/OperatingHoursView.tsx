import React from 'react';
import AppButton from '@/components/ui/AppButton/AppButton';
import { EditIcon } from '@/components/ui/icons';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';
import { formatTime, DAY_NAMES, DAYS_ORDER } from './utils';
import * as S from './SchedulePage.styles';

interface OperatingHoursViewProps {
  schedule: OperatingHoursResponseDto[];
  onEdit: () => void;
}

const OperatingHoursView: React.FC<OperatingHoursViewProps> = ({ schedule, onEdit }) => {
  // Создаем мапу дней для быстрого доступа
  const scheduleMap = schedule.reduce((acc, day) => {
    if (day.day_of_week) {
      acc[day.day_of_week] = day;
    }
    return acc;
  }, {} as Record<string, OperatingHoursResponseDto>);

  return (
    <S.ViewWrapper>
      {/* Основное расписание */}
      <S.ViewSection>
        <S.ViewSectionContent>
          <S.DayScheduleList>
            {DAYS_ORDER.map(day => {
              const daySchedule = scheduleMap[day];
              const dayName = DAY_NAMES[day] || day;
              
              let timeDisplay = '';
              if (daySchedule) {
                if (daySchedule.is_closed) {
                  timeDisplay = 'Выходной';
                } else {
                  const openTime = formatTime(daySchedule.open_time);
                  const closeTime = formatTime(daySchedule.close_time);
                  timeDisplay = `${openTime}—${closeTime}`;
                }
              }

              return (
                <S.DayScheduleItem key={day}>
                  <S.DayNameText>{dayName}</S.DayNameText>
                  <S.DayTimeText>{timeDisplay}</S.DayTimeText>
                </S.DayScheduleItem>
              );
            })}
          </S.DayScheduleList>
        </S.ViewSectionContent>
        <S.EditButtonWrapper>
          <AppButton 
            size="M" 
            variant="secondary" 
            onClick={onEdit}
            className="edit-button"
            onlyIcon
            iconLeft={<EditIcon />}
          />
        </S.EditButtonWrapper>
      </S.ViewSection>

      {/* Выходные и праздники (пока пустой раздел) */}
      <S.ViewSection>
        <S.ViewSectionContent>
          <S.DayScheduleList>
            <S.DayScheduleItem>
              <S.DayNameText>Выходные</S.DayNameText>
              <S.DayTimeText>10 апреля, 8 ноября</S.DayTimeText>
            </S.DayScheduleItem>
          </S.DayScheduleList>
        </S.ViewSectionContent>
        <S.EditButtonWrapper>
          <AppButton 
            size="M" 
            variant="secondary" 
            onClick={() => {}}
            className="edit-button"
            onlyIcon
            iconLeft={<EditIcon />}
          />
        </S.EditButtonWrapper>
      </S.ViewSection>
    </S.ViewWrapper>
  );
};

export default OperatingHoursView;

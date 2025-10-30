import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import OperatingHoursView from './OperatingHoursView';
import OperatingHoursForm from './OperatingHoursForm';
import type { UpdateRegularScheduleDto } from '../../../services/api-client/types.gen';
import * as S from './SchedulePage.styles';
import './SchedulePage.css';

const SchedulePage: React.FC = observer(() => {
  const { operatingHoursStore, authStore } = useStores();
  const [isEditing, setIsEditing] = useState(false);
  
  const serviceCenterUuid = authStore.user?.service_center_uuid;

  useEffect(() => {
    if (!serviceCenterUuid) {
      return;
    }
    
    operatingHoursStore.loadOperatingHours(serviceCenterUuid);
    
    return () => {
      operatingHoursStore.reset();
    };
  }, [operatingHoursStore, serviceCenterUuid]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (data: UpdateRegularScheduleDto) => {
    if (!serviceCenterUuid) {
      return;
    }
    
    try {
      await operatingHoursStore.updateRegularSchedule(serviceCenterUuid as string, data);
      setIsEditing(false);
    } catch (error) {
      // Ошибка уже обработана в store
      console.error('Failed to save operating hours:', error);
    }
  };

  if (!serviceCenterUuid) {
    return (
      <div className="schedule-page">
        <S.Container>
          <S.Title>Время работы</S.Title>
          <p>Не удалось определить сервисный центр</p>
        </S.Container>
      </div>
    );
  }

  if (operatingHoursStore.loading && operatingHoursStore.regularSchedule.length === 0) {
    return (
      <div className="schedule-page">
        <S.Container>
          <S.SkeletonTitle />
          <S.SkeletonTabs />
          <S.SkeletonContent />
        </S.Container>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <S.Container>
        <S.Title>Время работы</S.Title>
        
        <S.TabsContainer>
          <S.Tab $active={true}>
            Основное расписание
          </S.Tab>
          <S.Tab $active={false} disabled>
            Выходные и праздники
          </S.Tab>
        </S.TabsContainer>

        {isEditing ? (
          <OperatingHoursForm
            schedule={operatingHoursStore.regularSchedule}
            onSave={handleSave}
          />
        ) : (
          <OperatingHoursView
            schedule={operatingHoursStore.regularSchedule}
            onEdit={handleEdit}
          />
        )}
      </S.Container>
    </div>
  );
});

export default SchedulePage;

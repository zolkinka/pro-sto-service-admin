import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import OperatingHoursView from './OperatingHoursView';
import OperatingHoursForm from './OperatingHoursForm';
import type { UpdateRegularScheduleDto } from '../../../services/api-client/types.gen';
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
        <div className="schedule-page__container">
          <h1 className="schedule-page__title">Время работы</h1>
          <p>Не удалось определить сервисный центр</p>
        </div>
      </div>
    );
  }

  if (operatingHoursStore.loading && operatingHoursStore.regularSchedule.length === 0) {
    return (
      <div className="schedule-page">
        <div className="schedule-page__container">
          <div className="schedule-page__skeleton schedule-page__skeleton-title" />
          <div className="schedule-page__skeleton schedule-page__skeleton-tabs" />
          <div className="schedule-page__skeleton schedule-page__skeleton-content" />
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <div className="schedule-page__container">
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
      </div>
    </div>
  );
});

export default SchedulePage;

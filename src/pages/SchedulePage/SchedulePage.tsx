import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { useStores } from '@/hooks/useStores';
import OperatingHoursView from './OperatingHoursView';
import OperatingHoursForm from './OperatingHoursForm';
import HolidayPickerModal from './HolidayPickerModal';
import type { UpdateRegularScheduleDto } from '../../../services/api-client/types.gen';
import './SchedulePage.css';

const SchedulePage: React.FC = observer(() => {
  const { operatingHoursStore, authStore } = useStores();
  const [isEditing, setIsEditing] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  
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
      // Закрываем форму только при успешном сохранении
      setIsEditing(false);
    } catch (error) {
      // Ошибка уже обработана в store и показана пользователю
      // Форма остается открытой
      console.error('Failed to save operating hours:', error);
    }
  };

  const handleOpenHolidayModal = () => {
    setIsHolidayModalOpen(true);
  };

  const handleCloseHolidayModal = () => {
    setIsHolidayModalOpen(false);
  };

  const handleSaveHolidays = async (dates: Date[]) => {
    if (!serviceCenterUuid) {
      return;
    }

    try {
      // Форматируем выбранные даты
      const selectedFormattedDates = dates.map(date => format(date, 'yyyy-MM-dd'));
      
      // Находим даты, которые нужно удалить (были в списке, но больше не выбраны)
      const datesToDelete = operatingHoursStore.specialDates.filter(
        specialDate => specialDate.specific_date && 
                      specialDate.is_closed && 
                      !selectedFormattedDates.includes(specialDate.specific_date)
      );
      
      // Удаляем снятые с выбора даты
      for (const dateToDelete of datesToDelete) {
        if (dateToDelete.uuid) {
          await operatingHoursStore.deleteSpecialDate(serviceCenterUuid, dateToDelete.uuid);
        }
      }
      
      // Создаем специальные даты для каждой выбранной даты
      for (const date of dates) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Проверяем, существует ли уже эта дата в specialDates
        const existingDate = operatingHoursStore.specialDates.find(
          d => d.specific_date === formattedDate
        );
        
        // Если дата не существует, создаем её
        if (!existingDate) {
          await operatingHoursStore.createSpecialDate(serviceCenterUuid, {
            specific_date: formattedDate,
            is_closed: true,
            timezone: operatingHoursStore.timezone,
          });
        }
      }
    } catch (error) {
      // Ошибка уже обработана в store и показана пользователю
      // Пробрасываем ошибку дальше, чтобы модалка не закрылась
      console.error('Failed to save holidays:', error);
      throw error;
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
            onOpenHolidayModal={handleOpenHolidayModal}
          />
        ) : (
          <OperatingHoursView
            schedule={operatingHoursStore.regularSchedule}
            specialDates={operatingHoursStore.specialDates}
            onEdit={handleEdit}
            onOpenHolidayModal={handleOpenHolidayModal}
          />
        )}
      </div>
      
      <HolidayPickerModal
        isOpen={isHolidayModalOpen}
        onClose={handleCloseHolidayModal}
        onSave={handleSaveHolidays}
        existingHolidays={operatingHoursStore.specialDates
          .filter(d => d.specific_date)
          .map(d => new Date(d.specific_date!))}
      />
    </div>
  );
});

export default SchedulePage;

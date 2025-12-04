import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { useStores } from '@/hooks/useStores';
import OperatingHoursForm from './OperatingHoursForm';
import SpecialDateModal from './SpecialDateModal';
import type { SpecialDateData } from './SpecialDateModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';

export const ScheduleEditPage: React.FC = observer(() => {
  const { operatingHoursStore, authStore, toastStore } = useStores();
  const navigate = useNavigate();
  const serviceCenterUuid = authStore.user?.service_center_uuid;
  const [isSpecialDateModalOpen, setIsSpecialDateModalOpen] = useState(false);
  const [localSpecialDates, setLocalSpecialDates] = useState<OperatingHoursResponseDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasScheduleChanges, setHasScheduleChanges] = useState(false);
  const [pendingScheduleData, setPendingScheduleData] = useState<any>(null);

  useEffect(() => {
    if (!serviceCenterUuid) return;
    
    operatingHoursStore.loadOperatingHours(serviceCenterUuid);
    
    return () => {
      operatingHoursStore.reset();
    };
  }, [operatingHoursStore, serviceCenterUuid]);

  // Синхронизируем локальное состояние с данными из store
  useEffect(() => {
    setLocalSpecialDates(operatingHoursStore.specialDates);
  }, [operatingHoursStore.specialDates]);

  // Проверяем, есть ли изменения в специальных датах
  const hasSpecialDatesChanges = () => {
    const serverDates = operatingHoursStore.specialDates;
    
    // Если количество дат разное - есть изменения
    if (localSpecialDates.length !== serverDates.length) return true;
    
    // Проверяем каждую локальную дату
    for (const localDate of localSpecialDates) {
      const serverDate = serverDates.find(d => d.specific_date === localDate.specific_date);
      
      // Если дата новая - есть изменения
      if (!serverDate) return true;
      
      // Если данные отличаются - есть изменения
      if (
        serverDate.is_closed !== localDate.is_closed ||
        serverDate.open_time !== localDate.open_time ||
        serverDate.close_time !== localDate.close_time
      ) {
        return true;
      }
    }
    
    return false;
  };

  const hasChanges = hasSpecialDatesChanges() || hasScheduleChanges;

  if (!serviceCenterUuid) return null;

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    // Отключаем промежуточные уведомления для batch-операций
    const silentOptions = { showSuccessToast: false, showErrorToast: false };
    
    try {
      // Сначала сохраняем обычное расписание, если есть изменения
      if (hasScheduleChanges && pendingScheduleData) {
        await operatingHoursStore.updateRegularSchedule(serviceCenterUuid, pendingScheduleData, silentOptions);
        setHasScheduleChanges(false);
        setPendingScheduleData(null);
      }
      
      // Затем синхронизируем специальные даты
      const serverDates = operatingHoursStore.specialDates;
      const localDatesMap = new Map(localSpecialDates.map(d => [d.specific_date, d]));
      const serverDatesMap = new Map(serverDates.map(d => [d.specific_date, d]));
      
      // Удаляем даты, которые есть на сервере, но нет в локальном состоянии
      for (const serverDate of serverDates) {
        if (serverDate.specific_date && !localDatesMap.has(serverDate.specific_date)) {
          if (serverDate.uuid) {
            await operatingHoursStore.deleteSpecialDate(serviceCenterUuid, serverDate.uuid, silentOptions);
          }
        }
      }
      
      // Добавляем или обновляем даты из локального состояния
      for (const localDate of localSpecialDates) {
        if (!localDate.specific_date) continue;
        
        const serverDate = serverDatesMap.get(localDate.specific_date);
        
        if (!serverDate) {
          // Создаём новую дату
          await operatingHoursStore.createSpecialDate(serviceCenterUuid, {
            specific_date: localDate.specific_date,
            is_closed: localDate.is_closed,
            open_time: localDate.open_time as string | undefined,
            close_time: localDate.close_time as string | undefined,
            timezone: operatingHoursStore.timezone,
          }, silentOptions);
        } else {
          // Проверяем, нужно ли обновить существующую дату
          const needsUpdate = 
            serverDate.is_closed !== localDate.is_closed ||
            serverDate.open_time !== localDate.open_time ||
            serverDate.close_time !== localDate.close_time;
          
          if (needsUpdate && serverDate.uuid) {
            // Обновляем существующую дату
            await operatingHoursStore.deleteSpecialDate(serviceCenterUuid, serverDate.uuid, silentOptions);
            await operatingHoursStore.createSpecialDate(serviceCenterUuid, {
              specific_date: localDate.specific_date,
              is_closed: localDate.is_closed,
              open_time: localDate.open_time as string | undefined,
              close_time: localDate.close_time as string | undefined,
              timezone: operatingHoursStore.timezone,
            }, silentOptions);
          }
        }
      }
      
      // Показываем общее уведомление об успехе только после завершения всех операций
      toastStore.showSuccess('Расписание успешно обновлено');
      navigate(ROUTES.SCHEDULE);
    } catch (error) {
      // Показываем ошибку - сообщение уже содержится в operatingHoursStore.error
      const errorMessage = operatingHoursStore.error || 'Произошла ошибка при сохранении';
      toastStore.showError(errorMessage);
      console.error('Failed to save special dates:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleChange = useCallback((data: any) => {
    setPendingScheduleData(data);
    setHasScheduleChanges(true);
  }, []);

  const handleOpenSpecialDateModal = () => {
    setIsSpecialDateModalOpen(true);
  };

  const handleCloseSpecialDateModal = () => {
    setIsSpecialDateModalOpen(false);
  };

  const handleSaveSpecialDate = (data: SpecialDateData) => {
    const formattedDate = format(data.date, 'yyyy-MM-dd');
    
    // Проверяем, есть ли уже эта дата
    const existingIndex = localSpecialDates.findIndex(
      d => d.specific_date === formattedDate
    );
    
    const newDate: OperatingHoursResponseDto = {
      uuid: localSpecialDates[existingIndex]?.uuid || '',
      service_center_uuid: operatingHoursStore.regularSchedule[0]?.service_center_uuid || '',
      specific_date: formattedDate,
      is_closed: data.isHoliday,
      open_time: (data.isHoliday ? '00:00' : data.openTime || '09:00') as any,
      close_time: (data.isHoliday ? '00:00' : data.closeTime || '18:00') as any,
      timezone: operatingHoursStore.timezone,
      created_at: localSpecialDates[existingIndex]?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      // Обновляем существующую дату
      const updated = [...localSpecialDates];
      updated[existingIndex] = newDate;
      setLocalSpecialDates(updated);
    } else {
      // Добавляем новую дату
      setLocalSpecialDates([...localSpecialDates, newDate]);
    }
  };

  const handleDeleteSpecialDate = (specificDate: string) => {
    // Удаляем локально по specific_date, не трогая сервер
    setLocalSpecialDates(prev => prev.filter(d => d.specific_date !== specificDate));
  };

  if (operatingHoursStore.loading && operatingHoursStore.regularSchedule.length === 0) {
    return (
      <div className="schedule-page">
        <div className="schedule-page__container">
          <div className="schedule-page__skeleton schedule-page__skeleton-content" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="schedule-page__container">
        <OperatingHoursForm
          schedule={operatingHoursStore.regularSchedule}
          specialDates={localSpecialDates}
          onScheduleChange={handleScheduleChange}
          onOpenHolidayModal={handleOpenSpecialDateModal}
          onDeleteSpecialDate={handleDeleteSpecialDate}
        />
      </div>
      
      {hasChanges && (
        <div className="schedule-page__fixed-save-button">
          <button
            className="schedule-page__save-btn"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      )}
      
      <SpecialDateModal
        isOpen={isSpecialDateModalOpen}
        onClose={handleCloseSpecialDateModal}
        onSave={handleSaveSpecialDate}
      />
    </>
  );
});

ScheduleEditPage.displayName = 'ScheduleEditPage';

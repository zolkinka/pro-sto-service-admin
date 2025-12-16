import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import type { MessagePayload } from 'firebase/messaging';
import { useStores } from '@/hooks';
import { notificationService } from '@/services/notificationService';

// Интервал polling в миллисекундах (30 секунд)
const POLLING_INTERVAL_MS = 30 * 1000;

interface PendingBookingsContextValue {
  pendingBookings: string[];
  pendingCount: number;
  isModalOpen: boolean;
  currentPendingIndex: number;
  openModal: () => void;
  closeModal: () => void;
  handleUpdateBooking: () => void;
  handleConfirmBooking: () => Promise<void>;
  handleCancelBooking: () => Promise<void>;
  getCurrentBookingUuid: () => string | null;
}

const PendingBookingsContext = createContext<PendingBookingsContextValue | null>(null);

export const usePendingBookings = () => {
  const context = useContext(PendingBookingsContext);
  if (!context) {
    throw new Error('usePendingBookings must be used within PendingBookingsProvider');
  }
  return context;
};

interface PendingBookingsProviderProps {
  children: ReactNode;
}

export const PendingBookingsProvider = observer(({ children }: PendingBookingsProviderProps) => {
  const { bookingsStore, authStore } = useStores();
  
  const [pendingBookings, setPendingBookings] = useState<string[]>([]);
  const [currentPendingIndex, setCurrentPendingIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasCheckedOnStartup, setHasCheckedOnStartup] = useState(false);
  
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Функция для загрузки pending заказов
  const loadPendingBookings = useCallback(() => {
    const serviceCenterUuid = authStore.user?.service_center_uuid;
    
    if (serviceCenterUuid) {
      bookingsStore.setServiceCenterUuid(serviceCenterUuid);
      bookingsStore.fetchPendingBookings();
    }
  }, [authStore.user?.service_center_uuid, bookingsStore]);

  // Первоначальная загрузка pending заказов
  useEffect(() => {
    const serviceCenterUuid = authStore.user?.service_center_uuid;
    
    if (serviceCenterUuid && !hasCheckedOnStartup) {
      bookingsStore.setServiceCenterUuid(serviceCenterUuid);
      bookingsStore.fetchPendingBookings();
      setHasCheckedOnStartup(true);
    }
  }, [authStore.user, bookingsStore, hasCheckedOnStartup]);

  // Polling для периодической проверки
  useEffect(() => {
    const serviceCenterUuid = authStore.user?.service_center_uuid;
    
    if (!serviceCenterUuid) {
      return;
    }
    
    pollingIntervalRef.current = setInterval(() => {
      console.log('PendingBookingsProvider: Polling - проверка новых заказов');
      loadPendingBookings();
    }, POLLING_INTERVAL_MS);
    
    console.log('PendingBookingsProvider: Polling запущен');
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('PendingBookingsProvider: Polling остановлен');
      }
    };
  }, [authStore.user?.service_center_uuid, loadPendingBookings]);

  // Обработчик push-уведомлений
  useEffect(() => {
    const handlePushMessage = (payload: MessagePayload) => {
      console.log('PendingBookingsProvider: Push notification received:', payload);
      
      const notificationType = payload.data?.type;
      
      if (notificationType === 'newBooking' || notificationType === 'new_booking') {
        console.log('PendingBookingsProvider: Новое бронирование - загружаем pending заказы');
        loadPendingBookings();
      }
    };

    notificationService.addMessageHandler(handlePushMessage);
    console.log('PendingBookingsProvider: Подписка на push-уведомления активирована');

    return () => {
      notificationService.removeMessageHandler(handlePushMessage);
      console.log('PendingBookingsProvider: Отписка от push-уведомлений');
    };
  }, [loadPendingBookings]);

  // Обновление локального списка pending заказов
  useEffect(() => {
    if (!bookingsStore.isLoadingPending && bookingsStore.pendingBookings.length > 0) {
      const pendingUuids = bookingsStore.pendingBookings.map(b => b.uuid);
      
      if (JSON.stringify(pendingUuids) !== JSON.stringify(pendingBookings)) {
        setPendingBookings(pendingUuids);
      }
    } else if (!bookingsStore.isLoadingPending && bookingsStore.pendingBookings.length === 0 && pendingBookings.length > 0) {
      setPendingBookings([]);
    }
  }, [bookingsStore.pendingBookings, bookingsStore.isLoadingPending, pendingBookings]);

  const openModal = useCallback(() => {
    if (pendingBookings.length > 0) {
      setCurrentPendingIndex(0);
      setIsModalOpen(true);
    }
  }, [pendingBookings]);

  const closeModal = useCallback(() => {
    if (currentPendingIndex < pendingBookings.length - 1) {
      const nextIndex = currentPendingIndex + 1;
      setCurrentPendingIndex(nextIndex);
    } else {
      setIsModalOpen(false);
      setPendingBookings([]);
      setCurrentPendingIndex(0);
    }
  }, [currentPendingIndex, pendingBookings.length]);

  const handleUpdateBooking = useCallback(() => {
    bookingsStore.fetchPendingBookings();
    
    const updatedPending = pendingBookings.filter(
      (_uuid, idx) => idx !== currentPendingIndex
    );
    
    if (updatedPending.length > 0) {
      setPendingBookings(updatedPending);
      setCurrentPendingIndex(Math.min(currentPendingIndex, updatedPending.length - 1));
    } else {
      setIsModalOpen(false);
      setPendingBookings([]);
      setCurrentPendingIndex(0);
    }
  }, [bookingsStore, pendingBookings, currentPendingIndex]);

  const handleConfirmBooking = useCallback(async () => {
    const currentBookingUuid = pendingBookings[currentPendingIndex];
    
    try {
      const success = await bookingsStore.updateBookingStatus(currentBookingUuid, 'confirmed');
      
      if (success) {
        handleUpdateBooking();
      }
    } catch (error) {
      console.error('Ошибка подтверждения заказа:', error);
    }
  }, [pendingBookings, currentPendingIndex, bookingsStore, handleUpdateBooking]);

  const handleCancelBooking = useCallback(async () => {
    const currentBookingUuid = pendingBookings[currentPendingIndex];
    
    try {
      const success = await bookingsStore.updateBookingStatus(currentBookingUuid, 'cancelled');
      
      if (success) {
        handleUpdateBooking();
      }
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
    }
  }, [pendingBookings, currentPendingIndex, bookingsStore, handleUpdateBooking]);

  const getCurrentBookingUuid = useCallback(() => {
    if (pendingBookings.length > 0 && currentPendingIndex < pendingBookings.length) {
      return pendingBookings[currentPendingIndex];
    }
    return null;
  }, [pendingBookings, currentPendingIndex]);

  const value: PendingBookingsContextValue = {
    pendingBookings,
    pendingCount: pendingBookings.length,
    isModalOpen,
    currentPendingIndex,
    openModal,
    closeModal,
    handleUpdateBooking,
    handleConfirmBooking,
    handleCancelBooking,
    getCurrentBookingUuid,
  };

  return (
    <PendingBookingsContext.Provider value={value}>
      {children}
    </PendingBookingsContext.Provider>
  );
});

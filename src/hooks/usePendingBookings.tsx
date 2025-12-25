import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { MessagePayload } from 'firebase/messaging';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks';
import { notificationService } from '@/services/notificationService';

// Интервал polling в миллисекундах (1 минута)
const POLLING_INTERVAL_MS = 60 * 1000;
// Debounce задержка для предотвращения параллельных запросов
const DEBOUNCE_DELAY_MS = 300;

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

// Экспорт хука отдельно для Fast Refresh
const usePendingBookingsHook = () => {
  const context = useContext(PendingBookingsContext);
  if (!context) {
    throw new Error('usePendingBookings must be used within PendingBookingsProvider');
  }
  return context;
};

export { usePendingBookingsHook as usePendingBookings };

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
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serviceCenterUuidRef = useRef<string | null>(null);
  
  // Обновляем ref при изменении serviceCenterUuid
  useEffect(() => {
    serviceCenterUuidRef.current = authStore.user?.service_center_uuid || null;
  }, [authStore.user?.service_center_uuid]);

  // Функция для загрузки pending заказов с debounce
  const loadPendingBookings = useCallback(() => {
    // Отменяем предыдущий таймер если есть
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      const serviceCenterUuid = serviceCenterUuidRef.current;
      
      if (serviceCenterUuid) {
        try {
          bookingsStore.setServiceCenterUuid(serviceCenterUuid);
          bookingsStore.fetchPendingBookings();
        } catch (error) {
          console.error('PendingBookingsProvider: Ошибка загрузки pending заказов:', error);
        }
      } else {
        console.warn('PendingBookingsProvider: Missing serviceCenterUuid');
      }
    }, DEBOUNCE_DELAY_MS);
  }, [bookingsStore]);

  // Первоначальная загрузка pending заказов
  useEffect(() => {
    const serviceCenterUuid = authStore.user?.service_center_uuid;
    
    if (serviceCenterUuid && !hasCheckedOnStartup) {
      bookingsStore.setServiceCenterUuid(serviceCenterUuid);
      bookingsStore.fetchPendingBookings();
      setHasCheckedOnStartup(true);
    }
  }, [bookingsStore, hasCheckedOnStartup, authStore.user?.service_center_uuid]);

  // Polling для периодической проверки
  useEffect(() => {
    const serviceCenterUuid = serviceCenterUuidRef.current;
    
    if (!serviceCenterUuid) {
      return;
    }
    
    pollingIntervalRef.current = setInterval(() => {
      console.log('PendingBookingsProvider: Polling - проверка новых заказов');
      loadPendingBookings();
    }, POLLING_INTERVAL_MS);
    
    console.log('PendingBookingsProvider: Polling запущен (интервал: 60 сек)');
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('PendingBookingsProvider: Polling остановлен');
      }
      // Очищаем debounce таймер при размонтировании
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [loadPendingBookings]);

  // Ref для стабильного обработчика push-уведомлений
  const handlePushMessageRef = useRef<((payload: MessagePayload) => void) | undefined>(undefined);
  
  // Обновляем обработчик при изменении bookingsStore
  useEffect(() => {
    handlePushMessageRef.current = (payload: MessagePayload) => {
      console.log('PendingBookingsProvider: Push notification received:', payload);
      
      const notificationType = payload.data?.type;
      const hasBookingUuid = !!payload.data?.booking_uuid;
      const isNewBookingTitle = payload.notification?.title?.includes('Новая запись');
      
      // Определяем новое бронирование по типу, наличию booking_uuid или заголовку уведомления
      const isNewBooking = 
        notificationType === 'newBooking' || 
        notificationType === 'new_booking' ||
        notificationType === 'NEW_BOOKING' ||
        hasBookingUuid ||
        isNewBookingTitle;
      
      if (isNewBooking) {
        console.log('PendingBookingsProvider: Новое бронирование - загружаем pending заказы');
        
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          const serviceCenterUuid = serviceCenterUuidRef.current;
          
          if (serviceCenterUuid) {
            try {
              bookingsStore.setServiceCenterUuid(serviceCenterUuid);
              bookingsStore.fetchPendingBookings();
            } catch (error) {
              console.error('PendingBookingsProvider: Ошибка загрузки pending заказов:', error);
            }
          } else {
            console.warn('PendingBookingsProvider: Missing serviceCenterUuid');
          }
        }, DEBOUNCE_DELAY_MS);
      }
    };
  }, [bookingsStore]);

  // Подписка на push-уведомления (выполняется только один раз)
  useEffect(() => {
    const stableHandler = (payload: MessagePayload) => {
      if (handlePushMessageRef.current) {
        handlePushMessageRef.current(payload);
      }
    };

    notificationService.addMessageHandler(stableHandler);
    console.log('PendingBookingsProvider: Подписка на push-уведомления активирована');

    return () => {
      notificationService.removeMessageHandler(stableHandler);
      console.log('PendingBookingsProvider: Отписка от push-уведомлений');
    };
  }, []); // Пустой массив - подписка выполняется один раз

  // Обновление локального списка pending заказов
  useEffect(() => {
    if (!bookingsStore.isLoadingPending && bookingsStore.pendingBookings.length > 0) {
      const pendingUuids = bookingsStore.pendingBookings.map(b => b.uuid);
      
      // Сравниваем массивы эффективно без JSON.stringify
      const arraysAreDifferent = 
        pendingUuids.length !== pendingBookings.length ||
        pendingUuids.some((uuid, index) => uuid !== pendingBookings[index]);
      
      if (arraysAreDifferent) {
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

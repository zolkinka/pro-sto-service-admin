import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { MessagePayload } from 'firebase/messaging';
import { useStores } from '@/hooks';
import { usePlatform } from '@/hooks/usePlatform';
import ViewBookingModal from '@/pages/OrdersPage/components/ViewBookingModal/ViewBookingModal';
import { MobileNewBookingModal } from '@/mobile-components/Orders/MobileNewBookingModal';
import { notificationService } from '@/services/notificationService';

/**
 * Компонент для глобальной проверки новых заказов (pending_confirmation)
 * Показывает модальное окно с новыми заказами на любой странице приложения
 */
export const PendingBookingsChecker = observer(() => {
  const { bookingsStore, authStore } = useStores();
  const isMobile = usePlatform() === 'mobile';
  
  const [pendingBookings, setPendingBookings] = useState<string[]>([]);
  const [currentPendingIndex, setCurrentPendingIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasCheckedOnStartup, setHasCheckedOnStartup] = useState(false);

  // Первоначальная загрузка pending заказов при старте приложения
  useEffect(() => {
    const serviceCenterUuid = authStore.user?.service_center_uuid;
    
    if (serviceCenterUuid && !hasCheckedOnStartup) {
      // Устанавливаем UUID сервисного центра в store
      bookingsStore.setServiceCenterUuid(serviceCenterUuid);
      
      // Загружаем pending бронирования
      bookingsStore.fetchPendingBookings();
      
      setHasCheckedOnStartup(true);
    }
  }, [authStore.user, bookingsStore, hasCheckedOnStartup]);

  // Обработчик push-уведомлений когда приложение в фокусе
  useEffect(() => {
    const handlePushMessage = (payload: MessagePayload) => {
      console.log('Push notification received in foreground:', payload);
      
      // Проверяем, что это уведомление о новом заказе
      const notificationType = payload.data?.type;
      
      if (notificationType === 'newBooking' || notificationType === 'new_booking') {
        // Подтягиваем свежую информацию о pending заказах
        bookingsStore.fetchPendingBookings();
      }
    };

    // Подписываемся на push-уведомления
    notificationService.addMessageHandler(handlePushMessage);

    // Отписываемся при размонтировании
    return () => {
      notificationService.removeMessageHandler(handlePushMessage);
    };
  }, [bookingsStore]);

  // Эффект для автоматического показа pending заказов
  useEffect(() => {
    // После загрузки pending заказов проверяем их наличие
    if (!bookingsStore.isLoadingPending && bookingsStore.pendingBookings.length > 0) {
      const pendingUuids = bookingsStore.pendingBookings.map(b => b.uuid);
      
      if (pendingUuids.length > 0 && !isModalOpen) {
        setPendingBookings(pendingUuids);
        setCurrentPendingIndex(0);
        setIsModalOpen(true);
      }
    }
  }, [bookingsStore.pendingBookings, bookingsStore.isLoadingPending, isModalOpen]);

  const handleCloseModal = () => {
    // Переходим к следующему pending заказу или закрываем модалку
    if (currentPendingIndex < pendingBookings.length - 1) {
      const nextIndex = currentPendingIndex + 1;
      setCurrentPendingIndex(nextIndex);
    } else {
      // Все pending заказы просмотрены
      setIsModalOpen(false);
      setPendingBookings([]);
      setCurrentPendingIndex(0);
    }
  };

  const handleUpdateBooking = () => {
    // Перезагружаем список pending бронирований
    bookingsStore.fetchPendingBookings();
    
    // Убираем текущий заказ из локального списка pending
    const updatedPending = pendingBookings.filter(
      (_uuid, idx) => idx !== currentPendingIndex
    );
    
    if (updatedPending.length > 0) {
      setPendingBookings(updatedPending);
      // Индекс остается тем же, но теперь указывает на следующий элемент
      setCurrentPendingIndex(Math.min(currentPendingIndex, updatedPending.length - 1));
    } else {
      // Больше нет pending заказов
      setIsModalOpen(false);
      setPendingBookings([]);
      setCurrentPendingIndex(0);
    }
  };

  // Мобильные обработчики
  const handleConfirmBooking = async () => {
    const currentBookingUuid = pendingBookings[currentPendingIndex];
    
    try {
      const success = await bookingsStore.updateBookingStatus(currentBookingUuid, 'confirmed');
      
      if (success) {
        handleUpdateBooking();
      }
    } catch (error) {
      console.error('Ошибка подтверждения заказа:', error);
    }
  };

  const handleCancelBooking = async () => {
    const currentBookingUuid = pendingBookings[currentPendingIndex];
    
    try {
      const success = await bookingsStore.updateBookingStatus(currentBookingUuid, 'cancelled');
      
      if (success) {
        handleUpdateBooking();
      }
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
    }
  };

  if (!isModalOpen || pendingBookings.length === 0) {
    return null;
  }

  const currentBookingUuid = pendingBookings[currentPendingIndex];

  // Рендерим соответствующее модальное окно в зависимости от платформы
  if (isMobile) {
    return (
      <MobileNewBookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bookingUuid={currentBookingUuid}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
        currentPendingIndex={currentPendingIndex}
        totalPendingCount={pendingBookings.length}
      />
    );
  }

  return (
    <>
      <div className="view-booking-modal-backdrop" />
      <div className="view-booking-modal-wrapper">
        <ViewBookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bookingUuid={currentBookingUuid}
          onUpdate={handleUpdateBooking}
          showAsNewBooking={true}
          pendingCount={pendingBookings.length}
          currentPendingIndex={currentPendingIndex}
        />
      </div>
    </>
  );
});

PendingBookingsChecker.displayName = 'PendingBookingsChecker';

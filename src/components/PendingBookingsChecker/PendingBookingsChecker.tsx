import { observer } from 'mobx-react-lite';
import { usePlatform } from '@/hooks/usePlatform';
import { usePendingBookings } from '@/hooks/usePendingBookings';
import ViewBookingModal from '@/pages/OrdersPage/components/ViewBookingModal/ViewBookingModal';
import { MobileNewBookingModal } from '@/mobile-components/Orders/MobileNewBookingModal';

/**
 * Компонент для отображения модального окна с новыми заказами (pending_confirmation)
 * Показывает модальное окно только по клику на плашку
 */
export const PendingBookingsChecker = observer(() => {
  const isMobile = usePlatform() === 'mobile';
  const {
    isModalOpen,
    currentPendingIndex,
    pendingBookings,
    closeModal,
    handleUpdateBooking,
    handleConfirmBooking,
    handleCancelBooking,
    getCurrentBookingUuid,
  } = usePendingBookings();

  if (!isModalOpen || pendingBookings.length === 0) {
    return null;
  }

  const currentBookingUuid = getCurrentBookingUuid();

  if (!currentBookingUuid) {
    return null;
  }

  // Рендерим соответствующее модальное окно в зависимости от платформы
  if (isMobile) {
    return (
      <MobileNewBookingModal
        isOpen={isModalOpen}
        onClose={closeModal}
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
      <div className="view-booking-modal-backdrop" onClick={closeModal} />
      <div className="view-booking-modal-wrapper">
        <ViewBookingModal
          isOpen={isModalOpen}
          onClose={closeModal}
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

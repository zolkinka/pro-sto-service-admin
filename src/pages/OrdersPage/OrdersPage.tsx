import { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { startOfWeek, format } from 'date-fns';
import { useStores } from '@/hooks';
import CalendarHeader from './components/CalendarHeader/CalendarHeader';
import CalendarGrid from './components/CalendarGrid/CalendarGrid';
import ViewBookingModal from './components/ViewBookingModal/ViewBookingModal';
import CreateBookingModal from './components/CreateBookingModal/CreateBookingModal';
import './OrdersPage.css';

const OrdersPage = observer(() => {
  const { bookingsStore, authStore } = useStores();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  
  // State for create booking modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createBookingDate, setCreateBookingDate] = useState<Date | null>(null);
  const [createBookingTime, setCreateBookingTime] = useState<string>('');
  
  // Состояния для автоматического показа pending заказов
  const [pendingBookings, setPendingBookings] = useState<string[]>([]);
  const [currentPendingIndex, setCurrentPendingIndex] = useState(0);
  const [showingPendingBooking, setShowingPendingBooking] = useState(false);

  // Рабочие часы (динамически рассчитываются на основе заказов)
  const workingHours = useMemo(() => {
    if (bookingsStore.bookings.length === 0) {
      return { start: 9, end: 18 }; // дефолтные часы, если нет заказов
    }

    let minHour = 9;
    let maxHour = 18;

    bookingsStore.bookings.forEach((booking) => {
      const startTime = new Date(booking.start_time);
      const endTime = new Date(booking.end_time);
      
      const startHour = startTime.getHours();
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      
      // Если есть минуты в конце, округляем час вверх
      const effectiveEndHour = endMinute > 0 ? endHour + 1 : endHour;
      
      minHour = Math.min(minHour, startHour);
      maxHour = Math.max(maxHour, effectiveEndHour);
    });

    return { start: minHour, end: maxHour };
  }, [bookingsStore.bookings]);

  useEffect(() => {
    // Загрузка заказов при монтировании и изменении даты
    const serviceCenterUuid = authStore.user?.service_center_uuid;
    
    if (serviceCenterUuid) {
      // Устанавливаем UUID сервисного центра в store
      bookingsStore.setServiceCenterUuid(serviceCenterUuid);
      
      // Устанавливаем диапазон дат для недели
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      bookingsStore.setDateRange(weekStart, weekEnd);
      
      // Загружаем данные
      bookingsStore.fetchBookings();
    }
  }, [currentDate, authStore.user, bookingsStore]);

  // Эффект для автоматического показа pending заказов
  useEffect(() => {
    // После загрузки заказов проверяем наличие pending_confirmation
    if (!bookingsStore.isLoading && bookingsStore.bookings.length > 0) {
      const pending = bookingsStore.bookings
        .filter(b => b.status === 'pending_confirmation')
        .map(b => b.uuid);
      
      if (pending.length > 0 && !showingPendingBooking) {
        setPendingBookings(pending);
        setCurrentPendingIndex(0);
        setShowingPendingBooking(true);
        setSelectedBooking(pending[0]);
      }
    }
  }, [bookingsStore.bookings, bookingsStore.isLoading, showingPendingBooking]);

  const handleBookingClick = (bookingUuid: string) => {
    // При ручном клике сбрасываем режим автоматического показа
    setShowingPendingBooking(false);
    setSelectedBooking(bookingUuid);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    bookingsStore.clearSelectedBooking();
  };

  const handleClosePendingModal = () => {
    // Переходим к следующему pending заказу или закрываем модалку
    if (currentPendingIndex < pendingBookings.length - 1) {
      const nextIndex = currentPendingIndex + 1;
      setCurrentPendingIndex(nextIndex);
      setSelectedBooking(pendingBookings[nextIndex]);
    } else {
      // Все pending заказы просмотрены
      setShowingPendingBooking(false);
      setSelectedBooking(null);
      setPendingBookings([]);
      setCurrentPendingIndex(0);
    }
  };

  const handleUpdateBooking = () => {
    // Перезагружаем список заказов после обновления
    bookingsStore.fetchBookings();
  };

  const handleUpdateFromPending = () => {
    // Перезагружаем список заказов
    bookingsStore.fetchBookings();
    
    // Убираем текущий заказ из списка pending
    const updatedPending = pendingBookings.filter(
      (_uuid, idx) => idx !== currentPendingIndex
    );
    
    if (updatedPending.length > 0) {
      setPendingBookings(updatedPending);
      // Индекс остается тем же, но теперь указывает на следующий элемент
      const nextUuid = updatedPending[currentPendingIndex] || updatedPending[0];
      setSelectedBooking(nextUuid);
      setCurrentPendingIndex(Math.min(currentPendingIndex, updatedPending.length - 1));
    } else {
      // Больше нет pending заказов
      setShowingPendingBooking(false);
      setSelectedBooking(null);
      setPendingBookings([]);
      setCurrentPendingIndex(0);
    }
  };

  const handleSlotClick = (date: Date, hour: number) => {
    // Устанавливаем дату и время для создания бронирования
    setCreateBookingDate(date);
    setCreateBookingTime(format(new Date(date).setHours(hour, 0, 0, 0), 'HH:mm'));
    setIsCreateModalOpen(true);
  };

  const handleCreateBookingSuccess = () => {
    // Перезагружаем список заказов после успешного создания
    bookingsStore.fetchBookings();
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateBookingDate(null);
    setCreateBookingTime('');
  };

  // Вычисляем начало недели для передачи в WeekDaysRow и CalendarGrid
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="orders-page">
      <div className="orders-page__container">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {selectedBooking && (
          <ViewBookingModal
            isOpen={selectedBooking !== null}
            onClose={showingPendingBooking ? handleClosePendingModal : handleCloseModal}
            bookingUuid={selectedBooking}
            onUpdate={showingPendingBooking ? handleUpdateFromPending : handleUpdateBooking}
            showAsNewBooking={showingPendingBooking}
            pendingCount={pendingBookings.length}
            currentPendingIndex={currentPendingIndex}
          />
        )}

        {isCreateModalOpen && (
          <CreateBookingModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onSuccess={handleCreateBookingSuccess}
            initialDate={createBookingDate || undefined}
            initialTime={createBookingTime}
          />
        )}

        <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <CalendarGrid
            bookings={bookingsStore.bookings}
            weekStart={weekStart}
            onBookingClick={handleBookingClick}
            onSlotClick={handleSlotClick}
            workingHours={workingHours}
            isLoading={bookingsStore.isLoading}
          />
        </div>
      </div>
    </div>
  );
});

export default OrdersPage;

import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { startOfWeek } from 'date-fns';
import { useStores } from '@/hooks';
import CalendarHeader from './components/CalendarHeader/CalendarHeader';
import WeekDaysRow from './components/WeekDaysRow/WeekDaysRow';
import CalendarGrid from './components/CalendarGrid/CalendarGrid';
import EditBookingModal from './components/EditBookingModal/EditBookingModal';
import './OrdersPage.css';

const OrdersPage = observer(() => {
  const { bookingsStore, authStore } = useStores();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  // Рабочие часы (можно сделать настраиваемыми в будущем)
  const workingHours = { start: 9, end: 18 };

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

  const handleBookingClick = (bookingUuid: string) => {
    setSelectedBooking(bookingUuid);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    bookingsStore.clearSelectedBooking();
  };

  const handleUpdateBooking = () => {
    // Перезагружаем список заказов после обновления
    bookingsStore.fetchBookings();
  };

  // Вычисляем начало недели для передачи в WeekDaysRow и CalendarGrid
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="orders-page">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <WeekDaysRow startDate={weekStart} currentDate={currentDate} />

      <CalendarGrid
        bookings={bookingsStore.bookings}
        weekStart={weekStart}
        onBookingClick={handleBookingClick}
        workingHours={workingHours}
      />

      {selectedBooking && (
        <EditBookingModal
          isOpen={selectedBooking !== null}
          startHour={workingHours.start}
          endHour={workingHours.end}
          onClose={handleCloseModal}
          bookingUuid={selectedBooking}
          onUpdate={handleUpdateBooking}
        />
      )}
    </div>
  );
});

export default OrdersPage;

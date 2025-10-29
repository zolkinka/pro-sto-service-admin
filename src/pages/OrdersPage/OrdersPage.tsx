import { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { startOfWeek } from 'date-fns';
import { useStores } from '@/hooks';
import CalendarHeader from './components/CalendarHeader/CalendarHeader';
import CalendarGrid from './components/CalendarGrid/CalendarGrid';
import ViewBookingModal from './components/ViewBookingModal/ViewBookingModal';
import './OrdersPage.css';

const OrdersPage = observer(() => {
  const { bookingsStore, authStore } = useStores();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

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
            onClose={handleCloseModal}
            bookingUuid={selectedBooking}
            onUpdate={handleUpdateBooking}
          />
        )}

        <div style={{ position: 'relative' }}>
          <CalendarGrid
            bookings={bookingsStore.bookings}
            weekStart={weekStart}
            onBookingClick={handleBookingClick}
            workingHours={workingHours}
          />
        </div>
      </div>
    </div>
  );
});

export default OrdersPage;

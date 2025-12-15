import { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { startOfWeek, format, parse } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { useStores } from '@/hooks';
import { getWorkingHoursRangeForWeek } from '@/utils/scheduleHelpers';
import CalendarHeader from './components/CalendarHeader/CalendarHeader';
import CalendarGrid from './components/CalendarGrid/CalendarGrid';
import ViewBookingModal from './components/ViewBookingModal/ViewBookingModal';
import CreateBookingModal from './components/CreateBookingModal/CreateBookingModal';
import './OrdersPage.css';

// Хелпер для парсинга даты из URL формата dd-MM-yyyy
const parseDateFromUrl = (dateStr: string): Date | null => {
  try {
    const parsed = parse(dateStr, 'dd-MM-yyyy', new Date());
    if (!isNaN(parsed.getTime())) return parsed;
  } catch (e) {
    console.error('Invalid date param:', e);
  }
  return null;
};

const OrdersPage = observer(() => {
  const { bookingsStore, authStore, servicesStore, operatingHoursStore } = useStores();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Инициализируем состояние из URL параметров
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const dayParam = searchParams.get('day');
    const weekParam = searchParams.get('week');
    
    if (dayParam) {
      const parsed = parseDateFromUrl(dayParam);
      if (parsed) return parsed;
    }
    
    if (weekParam) {
      const parsed = parseDateFromUrl(weekParam);
      if (parsed) return parsed;
    }
    
    return new Date();
  });
  
  const [viewMode, setViewMode] = useState<'day' | 'week'>(() => {
    return searchParams.has('day') ? 'day' : 'week';
  });
  
  // State for create booking modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createBookingDate, setCreateBookingDate] = useState<Date | null>(null);
  const [createBookingTime, setCreateBookingTime] = useState<string>('');

  // Мемоизируем начало недели, чтобы избежать лишних ререндеров
  const weekStart = useMemo(() => {
    return startOfWeek(currentDate, { weekStartsOn: 1 });
  }, [currentDate]);

  // Рабочие часы на основе режима работы из operatingHoursStore
  const workingHours = useMemo(() => {
    // Если расписание еще не загружено, используем дефолтные значения
    if (operatingHoursStore.regularSchedule.length === 0) {
      return { start: 9, end: 18 };
    }

    return getWorkingHoursRangeForWeek(
      weekStart,
      operatingHoursStore.regularSchedule,
      operatingHoursStore.specialDates
    );
  }, [weekStart, operatingHoursStore.regularSchedule, operatingHoursStore.specialDates]);

  // Инициализация из URL при первом рендере
  useEffect(() => {
    if (isInitialized) return;
    
    const dayParam = searchParams.get('day');
    const weekParam = searchParams.get('week');
    
    if (dayParam) {
      const parsed = parseDateFromUrl(dayParam);
      if (parsed) {
        setCurrentDate(parsed);
        setViewMode('day');
        setIsInitialized(true);
        return;
      }
    }
    
    if (weekParam) {
      const parsed = parseDateFromUrl(weekParam);
      if (parsed) {
        setCurrentDate(parsed);
        setViewMode('week');
        setIsInitialized(true);
        return;
      }
    }
    
    // Если нет параметров, устанавливаем дефолтные
    if (!dayParam && !weekParam) {
      const params = new URLSearchParams();
      params.set('week', format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'dd-MM-yyyy'));
      setSearchParams(params, { replace: true });
    }
    
    setIsInitialized(true);
  }, [searchParams, setSearchParams, isInitialized]);

  // Синхронизируем URL с состоянием календаря при изменении даты/режима
  useEffect(() => {
    // Не обновляем URL до инициализации
    if (!isInitialized) return;
    
    const dayParam = searchParams.get('day');
    const weekParam = searchParams.get('week');
    const params = new URLSearchParams();
    
    if (viewMode === 'day') {
      const expectedDay = format(currentDate, 'dd-MM-yyyy');
      if (dayParam !== expectedDay) {
        params.set('day', expectedDay);
        setSearchParams(params, { replace: true });
      }
    } else {
      const expectedWeek = format(weekStart, 'dd-MM-yyyy');
      if (weekParam !== expectedWeek) {
        params.set('week', expectedWeek);
        setSearchParams(params, { replace: true });
      }
    }
  }, [currentDate, viewMode, weekStart, searchParams, setSearchParams, isInitialized]);

  useEffect(() => {
    // Не загружаем данные до инициализации из URL
    if (!isInitialized) return;
    
    // Загрузка заказов при монтировании и изменении даты или режима
    const serviceCenterUuid = authStore.user?.service_center_uuid;
    
    if (serviceCenterUuid) {
      // Устанавливаем UUID сервисного центра в store
      bookingsStore.setServiceCenterUuid(serviceCenterUuid);
      
      // Устанавливаем диапазон дат в зависимости от режима
      let dateStart: Date;
      let dateEnd: Date;
      
      if (viewMode === 'day') {
        // В режиме 'day' загружаем только выбранный день
        dateStart = new Date(currentDate);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd = new Date(currentDate);
        dateEnd.setHours(23, 59, 59, 999);
      } else {
        // В режиме 'week' загружаем всю неделю
        const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        dateStart = weekStartDate;
        dateEnd = new Date(weekStartDate);
        dateEnd.setDate(dateEnd.getDate() + 6);
        dateEnd.setHours(23, 59, 59, 999);
      }
      
      bookingsStore.setDateRange(dateStart, dateEnd);
      
      // Загружаем данные
      bookingsStore.fetchBookings();
      
      // Загружаем сервисы если их еще нет
      if (servicesStore.services.length === 0) {
        servicesStore.fetchServices();
      }
      
      // Загружаем расписание работы если его еще нет
      if (operatingHoursStore.regularSchedule.length === 0) {
        operatingHoursStore.loadOperatingHours(serviceCenterUuid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode, authStore.user?.service_center_uuid, isInitialized]);

  // Обработка query параметров для открытия бронирования
  useEffect(() => {
    const bookingParam = searchParams.get('booking');
    
    // Если есть параметр booking, открываем модалку
    if (bookingParam && bookingParam !== selectedBooking) {
      setSelectedBooking(bookingParam);
      
      // Сохраняем текущие параметры календаря при открытии модалки
      const params = new URLSearchParams(searchParams);
      params.delete('booking');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, selectedBooking, setSearchParams]);

  const handleBookingClick = (bookingUuid: string) => {
    setSelectedBooking(bookingUuid);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    bookingsStore.clearSelectedBooking();
    // Не перезагружаем данные при закрытии - они уже актуальны
  };

  const handleUpdateBooking = () => {
    // Перезагружаем список заказов после обновления
    bookingsStore.fetchBookings();
  };

  const handleSlotClick = (date: Date, hour: number) => {
    // Устанавливаем дату и время для создания бронирования
    setCreateBookingDate(date);
    setCreateBookingTime(format(new Date(date).setHours(hour, 0, 0, 0), 'HH:mm'));
    setIsCreateModalOpen(true);
  };

  const handleAddBookingClick = () => {
    // Открываем модалку создания записи от выбранной даты (время пользователь выберет в форме)
    setCreateBookingDate(currentDate);
    setCreateBookingTime('');
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
  
  // Получаем первый доступный основной сервис для загрузки слотов
  const selectedService = servicesStore.mainServices[0];
  const serviceCenterUuid = authStore.user?.service_center_uuid;

  // Фильтруем бронирования по активной категории, используя список услуг текущей категории.
  // (По аналогии с mobile: bookings API не отдаёт business_type в сущности заказа.)
  const visibleServiceUuids = useMemo(() => {
    return new Set(servicesStore.services.map((s) => s.uuid));
  }, [servicesStore.services]);

  const visibleBookings = useMemo(() => {
    if (visibleServiceUuids.size === 0) return [];
    return bookingsStore.bookings.filter((booking) => visibleServiceUuids.has(booking.service.uuid));
  }, [bookingsStore.bookings, visibleServiceUuids]);

  return (
    <div className="orders-page">
      <div className="orders-page__container">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          serviceCategory={servicesStore.activeCategory}
          onServiceCategoryChange={(category) => servicesStore.setActiveCategory(category)}
          onAddBooking={handleAddBookingClick}
        />

        {selectedBooking && (
          <ViewBookingModal
            isOpen={selectedBooking !== null}
            onClose={handleCloseModal}
            bookingUuid={selectedBooking}
            onUpdate={handleUpdateBooking}
            showAsNewBooking={false}
          />
        )}

        <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <CalendarGrid
            bookings={visibleBookings}
            weekStart={weekStart}
            onBookingClick={handleBookingClick}
            onSlotClick={handleSlotClick}
            workingHours={workingHours}
            isLoading={bookingsStore.isLoading}
            serviceCenterUuid={serviceCenterUuid}
            serviceUuid={selectedService?.uuid}
            viewMode={viewMode}
            currentDate={currentDate}
          />
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateBookingModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateBookingSuccess}
          initialDate={createBookingDate || undefined}
          initialTime={createBookingTime}
        />
      )}
    </div>
  );
});

export default OrdersPage;

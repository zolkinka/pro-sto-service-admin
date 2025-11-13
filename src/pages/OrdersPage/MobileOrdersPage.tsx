import { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { useStores } from '@/hooks';
import { MobileOrdersHeader } from '@/mobile-components/MobileHeader/MobileOrdersHeader';
import { MobileCalendarView } from '@/mobile-components/Orders/MobileCalendarView';
import { MobileBookingSlot } from '@/mobile-components/Orders/MobileBookingSlot';
import MobileCategoryTabs from '@/mobile-components/MobileCategoryTabs/MobileCategoryTabs';
import type { CategoryType } from '@/mobile-components/MobileCategoryTabs/MobileCategoryTabs';
import type { AdminBookingResponseDto } from '../../../services/api-client';
import './MobileOrdersPage.css';

export const MobileOrdersPage = observer(() => {
  const { bookingsStore, authStore, servicesStore } = useStores();
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ onMenuToggle: () => void; isMenuOpen: boolean }>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [uiCategory, setUiCategory] = useState<CategoryType>('car_wash');
  
  // Состояния для автоматического показа pending заказов
  const [pendingBookings, setPendingBookings] = useState<string[]>([]);
  const [currentPendingIndex, setCurrentPendingIndex] = useState(0);
  const [showingPendingBooking, setShowingPendingBooking] = useState(false);

  // Обновление текущего времени каждую секунду
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(format(now, 'HH:mm:ss'));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCategoryChange = (category: CategoryType) => {
    setUiCategory(category);
    servicesStore.setActiveCategory(category);
  };

  const handleMenuClick = () => {
    outletContext?.onMenuToggle();
  };

  const handleNotificationClick = () => {
    // TODO: Handle notification click
  };

  // Загружаем услуги и заказы при монтировании
  useEffect(() => {
    const serviceCenterUuid = authStore.user?.service_center_uuid;
    
    if (serviceCenterUuid) {
      bookingsStore.setServiceCenterUuid(serviceCenterUuid);
      
      // Устанавливаем диапазон дат для одного дня
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      bookingsStore.setDateRange(dayStart, dayEnd);
      bookingsStore.fetchBookings();
      bookingsStore.fetchPendingBookings();
      
      // Загружаем сервисы если их еще нет
      if (servicesStore.services.length === 0) {
        servicesStore.fetchServices();
      }
    }
  }, [selectedDate, authStore.user, bookingsStore, servicesStore]);

  // Эффект для автоматического показа pending заказов
  useEffect(() => {
    // После загрузки pending заказов проверяем их наличие
    if (!bookingsStore.isLoadingPending && bookingsStore.pendingBookings.length > 0) {
      const pendingUuids = bookingsStore.pendingBookings.map(b => b.uuid);
      
      if (pendingUuids.length > 0 && !showingPendingBooking && pendingBookings.length === 0) {
        setPendingBookings(pendingUuids);
        setCurrentPendingIndex(0);
        setShowingPendingBooking(true);
        // Переходим на страницу первого pending заказа
        navigate(`/orders/${pendingUuids[0]}?showAsNew=true&pendingIndex=${currentPendingIndex}&pendingTotal=${pendingUuids.length}`);
      }
    }
  }, [bookingsStore.pendingBookings, bookingsStore.isLoadingPending, showingPendingBooking, pendingBookings.length, currentPendingIndex, navigate]);

  // Генерируем временные слоты с 08:00 до 22:00
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 21; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeStr);
    }
    return slots;
  }, []);

  // Создаём мап для быстрого поиска business_type по uuid сервиса
  const serviceBusinessTypeMap = useMemo(() => {
    const map = new Map<string, 'car_wash' | 'tire_service'>();
    servicesStore.services.forEach(service => {
      map.set(service.uuid, service.business_type);
    });
    return map;
  }, [servicesStore.services]);

  // Группируем заказы по временным слотам с фильтрацией по категории
  const bookingsBySlot = useMemo(() => {
    const map = new Map<string, AdminBookingResponseDto[]>();
    
    bookingsStore.bookings.forEach((booking) => {
      // Фильтруем по категории
      const businessType = serviceBusinessTypeMap.get(booking.service?.uuid || '');
      if (businessType !== uiCategory) {
        return;
      }

      const startTime = new Date(booking.start_time);
      
      // Округляем до часа
      const hour = startTime.getHours();
      const slotKey = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!map.has(slotKey)) {
        map.set(slotKey, []);
      }
      map.get(slotKey)!.push(booking);
    });
    
    return map;
  }, [bookingsStore.bookings, uiCategory, serviceBusinessTypeMap]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleBookingClick = (uuid: string) => {
    navigate(`/orders/${uuid}`);
  };

  const handleAddBooking = () => {
    navigate('/orders/create');
  };

  const handleSlotClick = (timeSlot: string) => {
    // Парсим время слота (например, "14:00")
    const [hours] = timeSlot.split(':').map(Number);
    
    // Создаем дату с выбранным днем и временем
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(hours, 0, 0, 0);
    
    // Переходим на страницу создания бронирования с параметрами
    const dateParam = format(bookingDate, 'yyyy-MM-dd');
    const timeParam = timeSlot;
    navigate(`/orders/create?date=${dateParam}&time=${timeParam}`);
  };

  // Показываем все временные слоты
  const visibleSlots = timeSlots;

  return (
    <div className="mobile-orders-page">
      <MobileOrdersHeader 
        onMenuClick={handleMenuClick}
        onNotificationClick={handleNotificationClick}
        isMenuOpen={outletContext?.isMenuOpen || false}
      />
      
      <div className="mobile-orders-page__categories">
        <MobileCategoryTabs
          activeCategory={uiCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      <div className="mobile-orders-page__content">
        <div className="mobile-orders-page__form">
          <div className="mobile-orders-page__form-header">
            <MobileCalendarView
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>

          <div className="mobile-orders-page__toolbar">
            <div className="mobile-orders-page__time">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 7V14L18.2 18.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{currentTime}</span>
            </div>
            <div className="mobile-orders-page__add-section">
              <span className="mobile-orders-page__add-text">Добавить запись</span>
              <button 
                className="mobile-orders-page__add-btn"
                onClick={handleAddBooking}
                aria-label="Добавить запись"
              >
                <span className="mobile-orders-page__add-icon">+</span>
              </button>
            </div>
          </div>

          <div className="mobile-orders-page__slots-container">
            {bookingsStore.isLoading ? (
              <div className="mobile-orders-page__loading">
                Загрузка...
              </div>
            ) : (
              visibleSlots.map((timeSlot) => {
                const bookings = bookingsBySlot.get(timeSlot) || [];
                
                return (
                  <MobileBookingSlot
                    key={timeSlot}
                    time={timeSlot}
                    bookings={bookings}
                    onBookingClick={handleBookingClick}
                    onSlotClick={() => handleSlotClick(timeSlot)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

import { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { useStores } from '@/hooks';
import { MobileOrdersHeader } from '@/mobile-components/MobileHeader/MobileOrdersHeader';
import { MobileCalendarView } from '@/mobile-components/Orders/MobileCalendarView';
import { MobileBookingSlot } from '@/mobile-components/Orders/MobileBookingSlot';
import { MobileNewBookingModal } from '@/mobile-components/Orders/MobileNewBookingModal';
import { MobileViewBookingModal } from '@/mobile-components/Orders/MobileViewBookingModal';
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
  
  // Состояния для модального окна pending заказов
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<string[]>([]);
  const [currentPendingIndex, setCurrentPendingIndex] = useState(0);
  const [hasShownPending, setHasShownPending] = useState(false);
  
  // Состояния для модального окна просмотра заказа
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBookingUuid, setSelectedBookingUuid] = useState<string | null>(null);

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

  // Эффект для автоматического показа pending заказов в модальном окне
  useEffect(() => {
    if (!bookingsStore.isLoadingPending && bookingsStore.pendingBookings.length > 0 && !hasShownPending) {
      const pendingUuids = bookingsStore.pendingBookings.map(b => b.uuid);
      
      if (pendingUuids.length > 0) {
        setPendingBookings(pendingUuids);
        setCurrentPendingIndex(0);
        setIsModalOpen(true);
        setHasShownPending(true);
      }
    }
  }, [bookingsStore.pendingBookings, bookingsStore.isLoadingPending, hasShownPending]);

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
    setSelectedBookingUuid(uuid);
    setIsViewModalOpen(true);
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

  // Обработчики модального окна pending заказов
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Сбрасываем состояние после анимации закрытия
    setTimeout(() => {
      setPendingBookings([]);
      setCurrentPendingIndex(0);
    }, 300);
  };

  const handleConfirmBooking = async () => {
    const currentBookingUuid = pendingBookings[currentPendingIndex];
    
    try {
      const success = await bookingsStore.updateBookingStatus(currentBookingUuid, 'confirmed');
      
      if (success) {
        // Показываем следующий pending заказ или закрываем модалку
        const nextIndex = currentPendingIndex + 1;
        
        if (nextIndex < pendingBookings.length) {
          setCurrentPendingIndex(nextIndex);
        } else {
          handleCloseModal();
          // Обновляем список заказов
          bookingsStore.fetchBookings();
        }
      }
    } catch (error) {
      console.error('Ошибка подтверждения заказа:', error);
    }
  };

  const handleCancelBooking = async () => {
    const confirmed = window.confirm('Вы уверены, что хотите отменить эту запись?');
    if (!confirmed) return;

    const currentBookingUuid = pendingBookings[currentPendingIndex];
    
    try {
      const success = await bookingsStore.updateBookingStatus(currentBookingUuid, 'cancelled');
      
      if (success) {
        // Показываем следующий pending заказ или закрываем модалку
        const nextIndex = currentPendingIndex + 1;
        
        if (nextIndex < pendingBookings.length) {
          setCurrentPendingIndex(nextIndex);
        } else {
          handleCloseModal();
          // Обновляем список заказов
          bookingsStore.fetchBookings();
        }
      }
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
    }
  };

  // Обработчики модального окна просмотра заказа
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setSelectedBookingUuid(null);
    }, 300);
  };

  const handleCancelViewBooking = async () => {
    if (!selectedBookingUuid) return;

    const confirmed = window.confirm('Вы уверены, что хотите отменить эту запись?');
    if (!confirmed) return;
    
    try {
      const success = await bookingsStore.updateBookingStatus(selectedBookingUuid, 'cancelled');
      
      if (success) {
        handleCloseViewModal();
        // Обновляем список заказов
        bookingsStore.fetchBookings();
      }
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
    }
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

      {/* Modal for pending bookings */}
      {isModalOpen && pendingBookings.length > 0 && (
        <MobileNewBookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bookingUuid={pendingBookings[currentPendingIndex]}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
          currentPendingIndex={currentPendingIndex}
          totalPendingCount={pendingBookings.length}
        />
      )}

      {/* Modal for viewing booking details */}
      {isViewModalOpen && selectedBookingUuid && (
        <MobileViewBookingModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          bookingUuid={selectedBookingUuid}
          onCancel={handleCancelViewBooking}
        />
      )}
    </div>
  );
});

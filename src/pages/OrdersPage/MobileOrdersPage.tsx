import { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { useStores } from '@/hooks';
import { MobileCalendarView } from '@/mobile-components/Orders/MobileCalendarView';
import { MobileBookingSlot } from '@/mobile-components/Orders/MobileBookingSlot';
import { MobileNewBookingModal } from '@/mobile-components/Orders/MobileNewBookingModal';
import { MobileViewBookingModal } from '@/mobile-components/Orders/MobileViewBookingModal';
import MobileCategoryTabs from '@/mobile-components/MobileCategoryTabs/MobileCategoryTabs';
import type { CategoryType } from '@/mobile-components/MobileCategoryTabs/MobileCategoryTabs';
import type { AdminBookingResponseDto } from '../../../services/api-client';
import { serviceCenterGetSlots } from '../../../services/api-client';
import { getWorkingTimeSlots, getWorkingHoursForDate } from '@/utils/scheduleHelpers';
import './MobileOrdersPage.css';

export const MobileOrdersPage = observer(() => {
  const { bookingsStore, authStore, servicesStore, operatingHoursStore } = useStores();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Получаем дату из URL параметра или используем текущую дату
  const getInitialDate = (): Date => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        const parsedDate = parseISO(dateParam);
        if (isValid(parsedDate)) {
          return parsedDate;
        }
      } catch {
        // Если не удалось распарсить, используем текущую дату
      }
    }
    return new Date();
  };
  
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [uiCategory, setUiCategory] = useState<CategoryType>('car_wash');

  // Синхронизируем selectedDate с URL параметром date при навигации
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        const parsedDate = parseISO(dateParam);
        if (isValid(parsedDate)) {
          // Сравниваем только даты (без времени)
          const currentDateStr = format(selectedDate, 'yyyy-MM-dd');
          if (dateParam !== currentDateStr) {
            setSelectedDate(parsedDate);
          }
        }
      } catch {
        // Если не удалось распарсить, игнорируем
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  // Состояния для модального окна pending заказов
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<string[]>([]);
  const [currentPendingIndex, setCurrentPendingIndex] = useState(0);
  const [hasShownPending, setHasShownPending] = useState(false);

  // Состояние для модального окна просмотра деталей заказа
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBookingUuid, setSelectedBookingUuid] = useState<string>('');

  // Состояние для хранения доступных слотов (час -> доступен ли)
  const [availableSlots, setAvailableSlots] = useState<Record<number, boolean>>({});

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
      
      // Загружаем расписание работы
      operatingHoursStore.loadOperatingHours(serviceCenterUuid);
      
      // Загружаем сервисы если их еще нет
      if (servicesStore.services.length === 0) {
        servicesStore.fetchServices();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, authStore.user?.service_center_uuid]);

  // Загружаем доступные слоты для выбранного дня и категории
  useEffect(() => {
    const loadAvailableSlots = async () => {
      const serviceCenterUuid = authStore.user?.service_center_uuid;
      
      // Ждем загрузки сервисов
      if (servicesStore.services.length === 0) {
        setAvailableSlots({});
        return;
      }
      
      // Находим первый активный сервис выбранной категории для запроса слотов
      const activeService = servicesStore.services.find(
        service => service.business_type === uiCategory
      );
      
      if (!serviceCenterUuid || !activeService) {
        console.log('Missing serviceCenterUuid or serviceUuid, skipping slots loading');
        setAvailableSlots({});
        return;
      }

      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await serviceCenterGetSlots({
          uuid: serviceCenterUuid,
          serviceUuid: activeService.uuid,
          dateFrom: dateStr,
          dateTo: dateStr,
        });

        // Парсим слоты и создаем мап по часам
        const slots: Record<number, boolean> = {};
        response.forEach((timeSlot: string) => {
          const slotDate = new Date(timeSlot);
          const hour = slotDate.getHours();
          slots[hour] = true;
        });

        setAvailableSlots(slots);
      } catch (error) {
        console.error('Failed to load available slots:', error);
        setAvailableSlots({});
      }
    };

    loadAvailableSlots();
  }, [selectedDate, uiCategory, servicesStore.services.length, authStore.user?.service_center_uuid]);

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

  // Генерируем временные слоты на основе расписания работы
  const timeSlots = useMemo(() => {
    // Если расписание еще не загружено, возвращаем пустой массив
    if (operatingHoursStore.regularSchedule.length === 0) {
      return [];
    }
    
    // Получаем слоты для выбранной даты с учетом расписания работы
    const slots = getWorkingTimeSlots(
      selectedDate,
      operatingHoursStore.regularSchedule,
      operatingHoursStore.specialDates
    );
    
    return slots;
  }, [selectedDate, operatingHoursStore.regularSchedule, operatingHoursStore.specialDates]);

  // Проверяем, является ли день выходным
  const isClosedDay = useMemo(() => {
    if (operatingHoursStore.regularSchedule.length === 0) {
      return false;
    }
    
    const workingHours = getWorkingHoursForDate(
      selectedDate,
      operatingHoursStore.regularSchedule,
      operatingHoursStore.specialDates
    );
    
    return workingHours === null;
  }, [selectedDate, operatingHoursStore.regularSchedule, operatingHoursStore.specialDates]);

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
    // Обновляем URL параметр для сохранения выбранной даты
    setSearchParams({ date: format(date, 'yyyy-MM-dd') }, { replace: true });
  };

  const handleBookingClick = (uuid: string) => {
    setSelectedBookingUuid(uuid);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    // Обновляем список заказов после закрытия модалки
    bookingsStore.fetchBookings();
  };

  const handleCancelBookingFromView = async () => {
    if (!selectedBookingUuid) return;

    const confirmed = window.confirm('Вы уверены, что хотите отменить эту запись?');
    if (!confirmed) return;

    try {
      const success = await bookingsStore.updateBookingStatus(selectedBookingUuid, 'cancelled');
      
      if (success) {
        setIsViewModalOpen(false);
        // Обновляем список заказов
        bookingsStore.fetchBookings();
      }
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
    }
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
    
    // Проверяем, не является ли слот прошедшим
    if (bookingDate < new Date()) {
      return; // Не переходим на страницу создания для прошедших слотов
    }
    
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

  // Показываем все временные слоты
  const visibleSlots = timeSlots;

  return (
    <div className="mobile-orders-page">
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
            <button 
              className="mobile-orders-page__add-section"
              onClick={handleAddBooking}
              aria-label="Добавить запись"
            >
              <span className="mobile-orders-page__add-text">Добавить запись</span>
              <div className="mobile-orders-page__add-btn">
                <span className="mobile-orders-page__add-icon">+</span>
              </div>
            </button>
          </div>

          <div className="mobile-orders-page__slots-container">
            {bookingsStore.isLoading ? (
              <div className="mobile-orders-page__loading">
                Загрузка...
              </div>
            ) : isClosedDay ? (
              <div className="mobile-orders-page__closed-day">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M16 16L32 32M32 16L16 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>Выходной день</h3>
                <p>В этот день сервис не работает</p>
              </div>
            ) : (
              visibleSlots.map((timeSlot) => {
                const bookings = bookingsBySlot.get(timeSlot) || [];
                
                // Проверяем, является ли слот прошедшим
                const [hours] = timeSlot.split(':').map(Number);
                const slotDateTime = new Date(selectedDate);
                slotDateTime.setHours(hours, 0, 0, 0);
                const isPast = slotDateTime < new Date();
                
                // Проверяем, доступен ли слот для добавления новых бронирований
                const isSlotAvailable = availableSlots[hours] === true;
                
                return (
                  <MobileBookingSlot
                    key={timeSlot}
                    time={timeSlot}
                    bookings={bookings}
                    onBookingClick={handleBookingClick}
                    onSlotClick={() => handleSlotClick(timeSlot)}
                    isPast={isPast}
                    canAddMore={isSlotAvailable && !isPast}
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
          onCancel={handleCancelBookingFromView}
        />
      )}
    </div>
  );
});

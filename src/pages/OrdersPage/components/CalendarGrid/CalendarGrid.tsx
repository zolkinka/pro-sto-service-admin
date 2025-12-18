import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { format, isSameDay, addDays } from 'date-fns';
import type { AdminBookingResponseDto } from '../../../../../services/api-client';
import { serviceCenterGetSlots } from '../../../../../services/api-client';
import BookingCard from '../BookingCard/BookingCard';
import './CalendarGrid.css';

export interface CalendarGridProps {
  bookings: AdminBookingResponseDto[];
  weekStart: Date;
  onBookingClick: (bookingUuid: string) => void;
  onSlotClick?: (date: Date, hour: number) => void;
  workingHours: { start: number; end: number }; // например { start: 9, end: 18 }
  isLoading?: boolean;
  serviceCenterUuid?: string;
  serviceUuid?: string;
  viewMode?: 'day' | 'week';
  currentDate?: Date; // для режима 'day' - текущая выбранная дата
  onViewModeChange?: (mode: 'day' | 'week') => void;
  onSelectedDateChange?: (date: Date) => void;
}

// Расстояние между часами в пикселях: gap + высота строки времени (13px)
const TIME_ROW_HEIGHT = 13;
const TIME_ROW_GAP = 67; // увеличен для комфортного размещения карточек высотой 70px
const PIXELS_PER_HOUR = TIME_ROW_HEIGHT + TIME_ROW_GAP; // 13 + 67 = 80px
// Пикселей на минуту
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60; // 80 / 60 = 1.333
const DAY_COLUMN_WIDTH = 120; // ширина колонки для одного дня
const DAY_COLUMN_GAP = 4; // отступ между колонками дней (уменьшен для большей плотности)
const CARD_PADDING = 4; // отступ карточки от линий сетки в пикселях
const SLOT_VERTICAL_PADDING = 4; // вертикальный отступ между слотами (2px сверху + 2px снизу = 4px)
const DAY_MODE_CARD_WIDTH = 120; // фиксированная ширина карточки в режиме 'day'
const DAY_MODE_CARD_GAP = 8; // отступ между карточками в режиме 'day'
const BOOKING_CARD_HEIGHT = 70; // фиксированная высота карточки бронирования
const BOOKING_CARD_HEIGHT_COMPACT = 39; // фиксированная высота карточки в компактном режиме (когда есть moreCount)

interface BookingWithPosition extends AdminBookingResponseDto {
  top: number;
  height: number;
  dayIndex: number;
}

// Тип для хранения доступных слотов по дням и часам
interface AvailableSlots {
  [dayIndex: number]: {
    [hour: number]: boolean;
  };
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  bookings,
  weekStart,
  onBookingClick,
  onSlotClick,
  workingHours,
  isLoading = false,
  serviceCenterUuid,
  serviceUuid,
  viewMode = 'week',
  currentDate,
  onViewModeChange,
  onSelectedDateChange,
}) => {
  // Состояние для хранения доступных слотов
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots>({});
  // Состояние загрузки слотов для отображения скелетона
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  // Используем useRef для предотвращения дублирования запросов
  const isLoadingSlotsRef = React.useRef(false);
  // Ref для контейнера дней, чтобы получить его ширину
  const daysContainerRef = React.useRef<HTMLDivElement>(null);
  // Состояние для ширины одной колонки дня
  const [dayColumnWidth, setDayColumnWidth] = useState<number>(DAY_COLUMN_WIDTH);

  // Определяем диапазон часов для отображения
  // Учитываем как рабочие часы, так и фактические бронирования
  let minHour = workingHours.start;
  let maxHour = workingHours.end;
  
  // Расширяем диапазон, если есть бронирования вне рабочих часов
  bookings.forEach((booking) => {
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    
    minHour = Math.min(minHour, startHour);
    maxHour = Math.max(maxHour, endHour);
  });
  
  // Генерируем массив часов для отображения
  const hours: number[] = [];
  for (let hour = minHour; hour <= maxHour; hour++) {
    hours.push(hour);
  }

  // Функция для загрузки слотов для всей недели или одного дня
  const loadAvailableSlots = useCallback(async () => {
    // Предотвращаем повторную загрузку, если уже идет загрузка
    if (isLoadingSlotsRef.current) {
      console.log('Slots are already loading, skipping duplicate request');
      return;
    }

    if (!serviceCenterUuid || !serviceUuid) {
      console.log('Missing serviceCenterUuid or serviceUuid, skipping slots loading');
      return;
    }

    isLoadingSlotsRef.current = true;
    setIsLoadingSlots(true);
    const slots: AvailableSlots = {};

    try {
      // Вычисляем начало и конец периода в зависимости от режима
      let dateFrom: string;
      let dateTo: string;
      
      if (viewMode === 'day' && currentDate) {
        // В режиме 'day' загружаем только выбранный день
        dateFrom = format(currentDate, 'yyyy-MM-dd');
        dateTo = format(currentDate, 'yyyy-MM-dd');
      } else {
        // В режиме 'week' загружаем всю неделю
        const weekEnd = addDays(weekStart, 6);
        dateFrom = format(weekStart, 'yyyy-MM-dd');
        dateTo = format(weekEnd, 'yyyy-MM-dd');
      }

      // Делаем один запрос на период (день или неделю)
      const response = await serviceCenterGetSlots({
        uuid: serviceCenterUuid,
        serviceUuid: serviceUuid,
        dateFrom: dateFrom,
        dateTo: dateTo,
      });

      // Парсим слоты и группируем их по дням
      response.forEach((timeSlot: string) => {
        const slotDate = new Date(timeSlot);
        const hour = slotDate.getHours();
        
        let dayIndex = -1;
        
        if (viewMode === 'day' && currentDate) {
          // В режиме 'day' проверяем только выбранный день
          if (isSameDay(slotDate, currentDate)) {
            dayIndex = 0; // единственная колонка
          }
        } else {
          // В режиме 'week' определяем индекс дня недели (0-6)
          for (let i = 0; i < 7; i++) {
            if (isSameDay(slotDate, addDays(weekStart, i))) {
              dayIndex = i;
              break;
            }
          }
        }

        if (dayIndex !== -1 && !isNaN(hour)) {
          if (!slots[dayIndex]) {
            slots[dayIndex] = {};
          }
          slots[dayIndex][hour] = true;
        }
      });

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to load available slots:', error);
    } finally {
      isLoadingSlotsRef.current = false;
      setIsLoadingSlots(false);
    }
  }, [weekStart, serviceCenterUuid, serviceUuid, viewMode, currentDate]);

  // Загружаем слоты при изменении недели или сервиса
  useEffect(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  // Определяем количество дней для отображения в зависимости от режима
  const daysToShow = viewMode === 'day' ? 1 : 7;
  
  // Рассчитываем ширину колонки дня на основе доступного пространства
  useLayoutEffect(() => {
    const updateDayColumnWidth = () => {
      if (daysContainerRef.current) {
        const containerWidth = daysContainerRef.current.offsetWidth;
        // Вычисляем ширину одной колонки: (общая ширина - все gaps) / количество дней
        const totalGaps = DAY_COLUMN_GAP * (daysToShow - 1); // промежутки между днями
        const calculatedWidth = (containerWidth - totalGaps) / daysToShow;
        
        // Обновляем только если значение действительно изменилось
        setDayColumnWidth(prev => {
          if (Math.abs(prev - calculatedWidth) > 0.01) {
            return calculatedWidth;
          }
          return prev;
        });
      }
    };

    // Обновляем при монтировании с небольшой задержкой для корректного измерения
    const timeoutId = setTimeout(updateDayColumnWidth, 0);

    // Используем ResizeObserver для отслеживания изменений размера контейнера
    const resizeObserver = new ResizeObserver(() => {
      updateDayColumnWidth();
    });

    if (daysContainerRef.current) {
      resizeObserver.observe(daysContainerRef.current);
    }

    // Обновляем при изменении размера окна (для надежности)
    window.addEventListener('resize', updateDayColumnWidth);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDayColumnWidth);
    };
  }, [daysToShow]);

  // Рассчитываем позиции для каждого заказа
  const bookingsWithPositions: BookingWithPosition[] = bookings.map((booking) => {
    const startTime = new Date(booking.start_time);

    // В режиме 'day' показываем только заказы для выбранного дня
    if (viewMode === 'day' && currentDate) {
      if (!isSameDay(startTime, currentDate)) {
        return null;
      }
      // В режиме дня dayIndex будет использоваться как порядковый номер карточки в строке
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const minutesFromStart = (startHour - minHour) * 60 + startMinute;
      const top = minutesFromStart * PIXELS_PER_MINUTE + CARD_PADDING;
      const height = PIXELS_PER_HOUR - (CARD_PADDING * 2);

      return {
        ...booking,
        top,
        height,
        dayIndex: 0, // временно, будет перезаписан при группировке
      };
    }

    // В режиме 'week' определяем день недели (0-6)
    let dayIndex = -1;
    for (let i = 0; i < 7; i++) {
      if (isSameDay(startTime, addDays(weekStart, i))) {
        dayIndex = i;
        break;
      }
    }

    // Если заказ не попадает в текущую неделю, пропускаем
    if (dayIndex === -1) {
      return null;
    }

    // Рассчитываем top позицию относительно начала отображаемого диапазона
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    // Учитываем и часы, и минуты для точного позиционирования
    const minutesFromStart = (startHour - minHour) * 60 + startMinute;
    // Добавляем отступ сверху (CARD_PADDING) для визуального отделения от линии
    const top = minutesFromStart * PIXELS_PER_MINUTE + CARD_PADDING;

    // Высота карточки бронирования фиксирована - 70px согласно макету Figma
    const height = BOOKING_CARD_HEIGHT;

    return {
      ...booking,
      top,
      height,
      dayIndex,
    };
  }).filter((b): b is BookingWithPosition => b !== null);

  // Группируем заказы
  // В режиме 'day' группируем по часам (для горизонтального отображения)
  // В режиме 'week' группируем по дням
  const bookingsByDay: BookingWithPosition[][] = Array.from({ length: daysToShow }, () => []);
  
  if (viewMode === 'day') {
    // Функция для проверки пересечения двух записей по времени
    const bookingsOverlapInTime = (b1: BookingWithPosition, b2: BookingWithPosition): boolean => {
      const start1 = new Date(b1.start_time).getTime();
      const end1 = new Date(b1.end_time).getTime();
      const start2 = new Date(b2.start_time).getTime();
      const end2 = new Date(b2.end_time).getTime();
      
      return start1 < end2 && start2 < end1;
    };
    
    // Сортируем записи по времени начала
    const sortedBookings = [...bookingsWithPositions].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    // Алгоритм назначения треков (колонок) для перекрывающихся записей
    // Используем массив треков, где каждый трек содержит записи
    const tracks: BookingWithPosition[][] = [];
    
    sortedBookings.forEach((booking) => {
      // Находим первый трек, где текущая запись не пересекается ни с одной записью в треке
      let assignedTrack = -1;
      
      for (let i = 0; i < tracks.length; i++) {
        const hasOverlap = tracks[i].some(b => bookingsOverlapInTime(b, booking));
        if (!hasOverlap) {
          assignedTrack = i;
          break;
        }
      }
      
      // Если не нашли подходящий трек, создаем новый
      if (assignedTrack === -1) {
        assignedTrack = tracks.length;
        tracks.push([]);
      }
      
      // Назначаем dayIndex как номер трека
      booking.dayIndex = assignedTrack;
      tracks[assignedTrack].push(booking);
    });
  } else {
    // В режиме week группируем по дням как раньше
    bookingsWithPositions.forEach((booking) => {
      bookingsByDay[booking.dayIndex].push(booking);
    });
  }

  // Вычисляем высоту контейнера с бронированиями
  // Добавляем дополнительный час после последнего времени для отображения завершающих заказов
  const totalHours = hours.length;
  const bookingsHeight = totalHours * PIXELS_PER_HOUR;

  // В режиме 'day' группируем бронирования по часам для добавления плейсхолдеров
  const bookingsByHour: { [hour: number]: BookingWithPosition[] } = {};
  let maxCardsInHour = 0; // максимальное количество карточек (включая плейсхолдер) в одном часовом слоте
  
  if (viewMode === 'day') {
    bookingsWithPositions.forEach((booking) => {
      const startTime = new Date(booking.start_time);
      const hour = startTime.getHours();
      
      if (!bookingsByHour[hour]) {
        bookingsByHour[hour] = [];
      }
      bookingsByHour[hour].push(booking);
    });
    
    // Рассчитываем максимальное количество карточек в одном часовом слоте
    // Учитываем как существующие бронирования, так и плейсхолдеры
    hours.forEach((hour) => {
      const isAvailable = availableSlots[0]?.[hour] === true;
      if (!isAvailable) return;
      
      const slotDateTime = new Date(currentDate || new Date());
      slotDateTime.setHours(hour, 0, 0, 0);
      const isPast = slotDateTime < new Date();
      if (isPast) return;
      
      const hourBookingsCount = bookingsByHour[hour]?.length || 0;
      const cardsCount = hourBookingsCount + 1; // +1 для плейсхолдера
      maxCardsInHour = Math.max(maxCardsInHour, cardsCount);
    });
  }

  // В режиме 'week' группируем бронирования по дню и перекрывающимся временным интервалам
  // Структура: weekBookingsByDayAndSlot[dayIndex] = Array<BookingWithPosition[]>
  // где каждый элемент массива - это группа перекрывающихся записей
  const weekBookingsByDayAndSlot: { [dayIndex: number]: BookingWithPosition[][] } = {};
  
  if (viewMode === 'week') {
    // Функция для проверки перекрытия двух записей
    const bookingsOverlap = (b1: BookingWithPosition, b2: BookingWithPosition): boolean => {
      const start1 = new Date(b1.start_time).getTime();
      const end1 = new Date(b1.end_time).getTime();
      const start2 = new Date(b2.start_time).getTime();
      const end2 = new Date(b2.end_time).getTime();
      
      return start1 < end2 && start2 < end1;
    };
    
    // Группируем записи по дням
    const bookingsByDay: { [dayIndex: number]: BookingWithPosition[] } = {};
    bookingsWithPositions.forEach((booking) => {
      if (!bookingsByDay[booking.dayIndex]) {
        bookingsByDay[booking.dayIndex] = [];
      }
      bookingsByDay[booking.dayIndex].push(booking);
    });
    
    // Для каждого дня группируем перекрывающиеся записи
    Object.entries(bookingsByDay).forEach(([dayIndexStr, dayBookings]) => {
      const dayIndex = parseInt(dayIndexStr, 10);
      weekBookingsByDayAndSlot[dayIndex] = [];
      
      // Сортируем записи по времени начала
      const sortedBookings = [...dayBookings].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      
      // Группируем перекрывающиеся записи
      sortedBookings.forEach((booking) => {
        // Ищем группу, с которой эта запись перекрывается
        let foundGroup = false;
        for (const group of weekBookingsByDayAndSlot[dayIndex]) {
          // Проверяем, перекрывается ли с любой записью в группе
          if (group.some(b => bookingsOverlap(b, booking))) {
            group.push(booking);
            foundGroup = true;
            break;
          }
        }
        
        // Если не нашли группу, создаем новую
        if (!foundGroup) {
          weekBookingsByDayAndSlot[dayIndex].push([booking]);
        }
      });
    });
  }

  return (
    <div className={`calendar-grid ${isLoading ? 'calendar-grid--loading' : ''}`}>
      <div className="calendar-grid__content">
        {/* Колонка с временными метками */}
        <div className="calendar-grid__time-column">
          {hours.map((hour) => (
            <div key={hour} className="calendar-grid__time-row">
              <span className="calendar-grid__time-label">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </span>
            </div>
          ))}
        </div>

        {/* Сетка с днями */}
        <div className="calendar-grid__days-container" ref={daysContainerRef}>
          {isLoading || isLoadingSlots ? (
            /* Показываем скелетон на время загрузки заказов или слотов */
            <div 
              className="calendar-grid__skeleton"
              style={{ height: `${bookingsHeight}px` }}
            />
          ) : (
            <>
              {/* Фоновые колонки для выходных дней (дней без слотов) - только в режиме week */}
              {viewMode === 'week' && (
                <div 
                  className="calendar-grid__day-backgrounds"
                  style={{ height: `${bookingsHeight}px` }}
                >
                  {Array.from({ length: daysToShow }).map((_, dayIndex) => {
                    // Проверяем, есть ли хотя бы один слот в этот день
                    const hasSlotsForDay = availableSlots[dayIndex] && 
                      Object.keys(availableSlots[dayIndex]).length > 0;
                    
                    const left = dayIndex * (dayColumnWidth + DAY_COLUMN_GAP);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`calendar-grid__day-background ${!hasSlotsForDay ? 'calendar-grid__day-background--closed' : ''}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: `${left}px`,
                          width: `${dayColumnWidth}px`,
                          height: '100%',
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Горизонтальные линии сетки (для каждого часа) */}
              <div 
                className="calendar-grid__horizontal-lines"
                style={{ height: `${bookingsHeight}px` }}
              >
                {hours.map((hour, hourIndex) => (
                  <div
                    key={hour}
                    className="calendar-grid__hour-line"
                    style={{
                      top: `${hourIndex * PIXELS_PER_HOUR}px`,
                    }}
                  />
                ))}
              </div>

              {/* Вертикальные линии сетки (между днями) - только в режиме week */}
              {viewMode === 'week' && (
                <div 
                  className="calendar-grid__vertical-lines"
                  style={{ height: `${bookingsHeight}px` }}
                >
                  {Array.from({ length: daysToShow }).map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="calendar-grid__day-line"
                    />
                  ))}
                </div>
              )}

              {/* Кликабельные слоты для создания новых заказов - только в режиме week */}
              {onSlotClick && viewMode === 'week' && (
                <div 
                  className="calendar-grid__clickable-slots"
                  style={{ height: `${bookingsHeight}px` }}
                >
                  {hours.map((hour, hourIndex) => (
                    <React.Fragment key={hour}>
                      {Array.from({ length: daysToShow }).map((_, dayIndex) => {
                        const slotDate = addDays(weekStart, dayIndex);
                        const top = hourIndex * PIXELS_PER_HOUR;
                        const left = dayIndex * (dayColumnWidth + DAY_COLUMN_GAP);

                        // Проверяем, доступен ли этот слот
                        const isAvailable = availableSlots[dayIndex]?.[hour] === true;

                        // Показываем слот только если он доступен
                        if (!isAvailable) {
                          return null;
                        }

                        // Проверяем, не является ли слот прошедшим
                        const slotDateTime = new Date(slotDate);
                        slotDateTime.setHours(hour, 0, 0, 0);
                        const isPast = slotDateTime < new Date();
                        
                        // Не показываем слот для прошедшего времени
                        if (isPast) {
                          return null;
                        }

                        // Проверяем, есть ли уже бронирование в этом часу
                        // Проверяем все группы записей для данного дня
                        const hasBooking = weekBookingsByDayAndSlot[dayIndex]?.some(group => 
                          group.some(booking => {
                            const bookingHour = new Date(booking.start_time).getHours();
                            return bookingHour === hour;
                          })
                        ) ?? false;
                        
                        // Не показываем плейсхолдер, если уже есть бронирование
                        if (hasBooking) {
                          return null;
                        }

                        return (
                          <div
                            key={`${hour}-${dayIndex}`}
                            className="calendar-grid__clickable-slot"
                            style={{
                              position: 'absolute',
                              top: `${top + SLOT_VERTICAL_PADDING / 2}px`,
                              left: `${left}px`,
                              width: `${dayColumnWidth}px`,
                              height: `${PIXELS_PER_HOUR - SLOT_VERTICAL_PADDING}px`,
                            }}
                            onClick={() => onSlotClick(slotDate, hour)}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Карточки заказов */}
              <div 
                className="calendar-grid__bookings"
                style={{
                  height: `${bookingsHeight}px`,
                  // В режиме day устанавливаем минимальную ширину для горизонтальной прокрутки
                  minWidth: viewMode === 'day' && maxCardsInHour > 0
                    ? `${maxCardsInHour * (DAY_MODE_CARD_WIDTH + DAY_MODE_CARD_GAP)}px`
                    : undefined,
                }}
              >
                {viewMode === 'day' ? (
                  // В режиме 'day' показываем все карточки горизонтально
                  bookingsWithPositions.map((booking) => {
                    const left = booking.dayIndex * (DAY_MODE_CARD_WIDTH + DAY_MODE_CARD_GAP);
                    const width = DAY_MODE_CARD_WIDTH;
                    
                    return (
                      <div
                        key={booking.uuid}
                        className="calendar-grid__booking-wrapper"
                        style={{
                          position: 'absolute',
                          top: `${booking.top}px`,
                          left: `${left}px`,
                          width: `${width}px`,
                        }}
                      >
                        <BookingCard
                          booking={booking}
                          onClick={() => onBookingClick(booking.uuid)}
                          style={{ height: `${booking.height}px` }}
                        />
                      </div>
                    );
                  })
                ) : (
                  // В режиме 'week' показываем карточки, группируя только перекрывающиеся
                  Object.entries(weekBookingsByDayAndSlot).flatMap(([dayIndexStr, bookingGroups]) => {
                    const dayIndex = parseInt(dayIndexStr, 10);
                    
                    return bookingGroups.map((slotBookings, groupIndex) => {
                      const firstBooking = slotBookings[0];
                      const moreCount = slotBookings.length - 1;
                      
                      const left = dayIndex * (dayColumnWidth + DAY_COLUMN_GAP);
                      const width = dayColumnWidth;
                      
                      // Для canAddMore берем час из первой записи в группе
                      const startTime = new Date(firstBooking.start_time);
                      const hour = startTime.getHours();
                      
                      // Проверяем, можно ли добавить новое бронирование
                      const hasBookingsInSlot = slotBookings.length > 0;
                      const isSlotAvailable = availableSlots[dayIndex]?.[hour] === true;
                      const isWorkingHour = hour >= workingHours.start && hour <= workingHours.end;
                      const slotDate = addDays(weekStart, dayIndex);
                      const slotDateTime = new Date(slotDate);
                      slotDateTime.setHours(hour, 0, 0, 0);
                      const isPast = slotDateTime < new Date();
                      const canAddMore = (isSlotAvailable || (isWorkingHour && hasBookingsInSlot)) && !isPast && onSlotClick;
                      
                      // Используем компактную высоту если есть дополнительные заказы
                      const cardHeight = moreCount > 0 ? BOOKING_CARD_HEIGHT_COMPACT : BOOKING_CARD_HEIGHT;
                      
                      // Склонение слова "заказ"
                      const getOrderWord = (count: number): string => {
                        const lastDigit = count % 10;
                        const lastTwoDigits = count % 100;
                        
                        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
                          return 'заказов';
                        }
                        if (lastDigit === 1) {
                          return 'заказ';
                        }
                        if (lastDigit >= 2 && lastDigit <= 4) {
                          return 'заказа';
                        }
                        return 'заказов';
                      };
                      
                      return (
                        <div
                          key={`${dayIndex}-${groupIndex}`}
                          className={`calendar-grid__booking-wrapper ${moreCount > 0 ? 'calendar-grid__booking-wrapper--multi' : ''}`}
                          style={{
                            position: 'absolute',
                            top: `${firstBooking.top}px`,
                            left: `${left}px`,
                            width: `${width}px`,
                            height: `${BOOKING_CARD_HEIGHT}px`, // фиксированная высота обертки
                          }}
                        >
                          <BookingCard
                            booking={firstBooking}
                            onClick={() => onBookingClick(firstBooking.uuid)}
                            style={{ height: `${cardHeight}px` }}
                            moreCount={moreCount > 0 ? moreCount : undefined}
                          />
                          
                          {/* Надпись о дополнительных заказах */}
                          {moreCount > 0 && (
                            <button 
                              className="calendar-grid__more-count"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewModeChange?.('day');
                                onSelectedDateChange?.(slotDate);
                              }}
                              type="button"
                            >
                              Еще {moreCount} {getOrderWord(moreCount)}
                            </button>
                          )}
                          
                          {/* Кнопка плюса */}
                          {canAddMore && (
                            <button
                              className="calendar-grid__plus-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSlotClick!(slotDate, hour);
                              }}
                              aria-label="Добавить заказ"
                              type="button"
                            >
                              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    });
                  })
                )}

                {/* Плейсхолдеры для добавления новых бронирований в режиме 'day' */}
                {viewMode === 'day' && onSlotClick && currentDate && hours.map((hour, hourIndex) => {
                  // Проверяем, можно ли добавить бронирование в этот час
                  // Разрешаем если: есть слоты с сервера ИЛИ (это рабочий час И уже есть бронирования)
                  const hasBookingsInSlot = (bookingsByHour[hour]?.length || 0) > 0;
                  const isAvailable = availableSlots[0]?.[hour] === true;
                  const isWorkingHour = hour >= workingHours.start && hour <= workingHours.end;
                  const canShow = isAvailable || (isWorkingHour && hasBookingsInSlot);
                  
                  // Не показываем плейсхолдер если нельзя добавить
                  if (!canShow) {
                    return null;
                  }

                  // Проверяем, не является ли слот прошедшим
                  const slotDateTime = new Date(currentDate);
                  slotDateTime.setHours(hour, 0, 0, 0);
                  const isPast = slotDateTime < new Date();
                  
                  // Не показываем плейсхолдер для прошедшего времени
                  if (isPast) {
                    return null;
                  }
                  
                  // Считаем количество бронирований на этот час
                  const hourBookingsCount = bookingsByHour[hour]?.length || 0;
                  
                  // Позиция плейсхолдера после всех бронирований
                  const left = hourBookingsCount * (DAY_MODE_CARD_WIDTH + DAY_MODE_CARD_GAP);
                  const top = hourIndex * PIXELS_PER_HOUR + CARD_PADDING;
                  const height = PIXELS_PER_HOUR - (CARD_PADDING * 2);
                  
                  return (
                    <div
                      key={`placeholder-${hour}`}
                      className="calendar-grid__placeholder-wrapper"
                      style={{
                        position: 'absolute',
                        top: `${top}px`,
                        left: `${left}px`,
                        width: `${DAY_MODE_CARD_WIDTH}px`,
                        height: `${height}px`,
                      }}
                      onClick={() => onSlotClick(currentDate, hour)}
                    >
                      <div className="calendar-grid__placeholder">
                        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;

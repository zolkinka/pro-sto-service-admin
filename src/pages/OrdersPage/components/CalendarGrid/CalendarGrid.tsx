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
}

// Расстояние между часами в пикселях: gap (50px) + высота строки времени (13px)
const TIME_ROW_HEIGHT = 13;
const TIME_ROW_GAP = 50;
const PIXELS_PER_HOUR = TIME_ROW_HEIGHT + TIME_ROW_GAP; // 13 + 50 = 63px
// Пикселей на минуту
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60; // 63 / 60 = 1.05
const DAY_COLUMN_WIDTH = 120; // ширина колонки для одного дня
const DAY_COLUMN_GAP = 4; // отступ между колонками дней (уменьшен для большей плотности)
const CARD_PADDING = 4; // отступ карточки от линий сетки в пикселях
const SLOT_VERTICAL_PADDING = 4; // вертикальный отступ между слотами (2px сверху + 2px снизу = 4px)

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

  // Генерируем массив часов для отображения
  const hours: number[] = [];
  for (let hour = workingHours.start; hour <= workingHours.end; hour++) {
    hours.push(hour);
  }

  // Функция для загрузки слотов для всей недели
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
      // Вычисляем начало и конец недели
      const weekEnd = addDays(weekStart, 6);
      const dateFrom = format(weekStart, 'yyyy-MM-dd');
      const dateTo = format(weekEnd, 'yyyy-MM-dd');

      // Делаем один запрос на всю неделю
      const response = await serviceCenterGetSlots({
        uuid: serviceCenterUuid,
        serviceUuid: serviceUuid,
        dateFrom: dateFrom,
        dateTo: dateTo,
      });

      // Парсим слоты и группируем их по дням недели
      response.forEach((timeSlot: string) => {
        const slotDate = new Date(timeSlot);
        const hour = slotDate.getHours();
        
        // Определяем индекс дня недели (0-6)
        let dayIndex = -1;
        for (let i = 0; i < 7; i++) {
          if (isSameDay(slotDate, addDays(weekStart, i))) {
            dayIndex = i;
            break;
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
  }, [weekStart, serviceCenterUuid, serviceUuid]);

  // Загружаем слоты при изменении недели или сервиса
  useEffect(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  // Рассчитываем ширину колонки дня на основе доступного пространства
  useLayoutEffect(() => {
    const updateDayColumnWidth = () => {
      if (daysContainerRef.current) {
        const containerWidth = daysContainerRef.current.offsetWidth;
        // Вычисляем ширину одной колонки: (общая ширина - все gaps) / 7 дней
        const totalGaps = DAY_COLUMN_GAP * 6; // 6 промежутков между 7 днями
        const calculatedWidth = (containerWidth - totalGaps) / 7;
        
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
  }, []);

  // Рассчитываем позиции для каждого заказа
  const bookingsWithPositions: BookingWithPosition[] = bookings.map((booking) => {
    const startTime = new Date(booking.start_time);

    // Определяем день недели (0-6)
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

    // Рассчитываем top позицию относительно начала рабочего дня
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const minutesFromStart = (startHour - workingHours.start) * 60 + startMinute;
    // Добавляем отступ сверху (CARD_PADDING) для визуального отделения от линии
    const top = minutesFromStart * PIXELS_PER_MINUTE + CARD_PADDING;

    // Высота карточки бронирования фиксирована - 1 час (как и слоты)
    // Вычитаем отступы сверху и снизу (CARD_PADDING * 2)
    const height = PIXELS_PER_HOUR - (CARD_PADDING * 2);

    return {
      ...booking,
      top,
      height,
      dayIndex,
    };
  }).filter((b): b is BookingWithPosition => b !== null);

  // Группируем заказы по дням для подсчета перекрытий
  const bookingsByDay: BookingWithPosition[][] = Array.from({ length: 7 }, () => []);
  bookingsWithPositions.forEach((booking) => {
    bookingsByDay[booking.dayIndex].push(booking);
  });

  // Вычисляем высоту контейнера с бронированиями
  // Добавляем дополнительный час после последнего времени для отображения завершающих заказов
  const totalHours = hours.length;
  const bookingsHeight = totalHours * PIXELS_PER_HOUR;

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
              {/* Фоновые колонки для выходных дней (дней без слотов) */}
              <div 
                className="calendar-grid__day-backgrounds"
                style={{ height: `${bookingsHeight}px` }}
              >
                {Array.from({ length: 7 }).map((_, dayIndex) => {
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

              {/* Вертикальные линии сетки (между днями) */}
              <div 
                className="calendar-grid__vertical-lines"
                style={{ height: `${bookingsHeight}px` }}
              >
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="calendar-grid__day-line"
                  />
                ))}
              </div>

              {/* Кликабельные слоты для создания новых заказов */}
              {onSlotClick && (
                <div 
                  className="calendar-grid__clickable-slots"
                  style={{ height: `${bookingsHeight}px` }}
                >
                  {hours.map((hour, hourIndex) => (
                    <React.Fragment key={hour}>
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
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
                style={{ height: `${bookingsHeight}px` }}
              >
                {bookingsWithPositions.map((booking) => {
                  const left = booking.dayIndex * (dayColumnWidth + DAY_COLUMN_GAP);
                  
                  return (
                    <div
                      key={booking.uuid}
                      className="calendar-grid__booking-wrapper"
                      style={{
                        position: 'absolute',
                        top: `${booking.top}px`,
                        left: `${left}px`,
                        width: `${dayColumnWidth}px`,
                      }}
                    >
                      <BookingCard
                        booking={booking}
                        onClick={() => onBookingClick(booking.uuid)}
                        style={{ height: `${booking.height}px` }}
                      />
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

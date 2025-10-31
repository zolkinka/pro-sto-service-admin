import React from 'react';
import { differenceInMinutes, format, isSameDay, addDays } from 'date-fns';
import type { AdminBookingResponseDto } from '../../../../../services/api-client';
import BookingCard from '../BookingCard/BookingCard';
import './CalendarGrid.css';

export interface CalendarGridProps {
  bookings: AdminBookingResponseDto[];
  weekStart: Date;
  onBookingClick: (bookingUuid: string) => void;
  onSlotClick?: (date: Date, hour: number) => void;
  workingHours: { start: number; end: number }; // например { start: 9, end: 18 }
  isLoading?: boolean;
}

// Расстояние между часами в пикселях: gap (50px) + высота строки времени (13px)
const TIME_ROW_HEIGHT = 13;
const TIME_ROW_GAP = 50;
const PIXELS_PER_HOUR = TIME_ROW_HEIGHT + TIME_ROW_GAP; // 13 + 50 = 63px
// Пикселей на минуту
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60; // 63 / 60 = 1.05
const DAY_COLUMN_WIDTH = 120; // ширина колонки для одного дня
const DAY_COLUMN_GAP = 12; // отступ между колонками дней
const CARD_PADDING = 4; // отступ карточки от линий сетки в пикселях

interface BookingWithPosition extends AdminBookingResponseDto {
  top: number;
  height: number;
  dayIndex: number;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  bookings,
  weekStart,
  onBookingClick,
  onSlotClick,
  workingHours,
  isLoading = false,
}) => {
  // Генерируем массив часов для отображения
  const hours: number[] = [];
  for (let hour = workingHours.start; hour <= workingHours.end; hour++) {
    hours.push(hour);
  }

  // Рассчитываем позиции для каждого заказа
  const bookingsWithPositions: BookingWithPosition[] = bookings.map((booking) => {
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

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

    // Рассчитываем высоту карточки
    const durationMinutes = differenceInMinutes(endTime, startTime);
    // Вычитаем отступы сверху и снизу (CARD_PADDING * 2)
    const height = durationMinutes * PIXELS_PER_MINUTE - (CARD_PADDING * 2);

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
        <div className="calendar-grid__days-container">
          {isLoading ? (
            /* Показываем скелетон на время загрузки */
            <div 
              className="calendar-grid__skeleton"
              style={{ height: `${bookingsHeight}px` }}
            />
          ) : (
            <>
              {/* Горизонтальные линии для каждого часа */}
              <div 
                className="calendar-grid__horizontal-lines"
                style={{ height: `${bookingsHeight}px` }}
              >
                {hours.map((hour, index) => {
                  // Каждая линия располагается точно на расстоянии index * 63px от начала
                  const top = index * PIXELS_PER_HOUR;
                  return (
                    <div 
                      key={hour} 
                      className="calendar-grid__hour-line"
                      style={{ top: `${top}px` }}
                    />
                  );
                })}
              </div>

              {/* Вертикальные линии для каждого дня */}
              <div 
                className="calendar-grid__vertical-lines"
                style={{ height: `${bookingsHeight}px` }}
              >
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="calendar-grid__day-line" />
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
                        const left = dayIndex * (DAY_COLUMN_WIDTH + DAY_COLUMN_GAP);

                        return (
                          <div
                            key={`${hour}-${dayIndex}`}
                            className="calendar-grid__clickable-slot"
                            style={{
                              position: 'absolute',
                              top: `${top}px`,
                              left: `${left}px`,
                              width: `${DAY_COLUMN_WIDTH}px`,
                              height: `${PIXELS_PER_HOUR}px`,
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
                  const left = booking.dayIndex * (DAY_COLUMN_WIDTH + DAY_COLUMN_GAP);
                  
                  return (
                    <div
                      key={booking.uuid}
                      className="calendar-grid__booking-wrapper"
                      style={{
                        position: 'absolute',
                        top: `${booking.top}px`,
                        left: `${left}px`,
                        width: `${DAY_COLUMN_WIDTH}px`,
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

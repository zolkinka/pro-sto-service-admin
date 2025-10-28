import React from 'react';
import { differenceInMinutes, format, isSameDay, addDays } from 'date-fns';
import type { AdminBookingResponseDto } from '../../../../../services/api-client';
import BookingCard from '../BookingCard/BookingCard';
import './CalendarGrid.css';

export interface CalendarGridProps {
  bookings: AdminBookingResponseDto[];
  weekStart: Date;
  onBookingClick: (bookingUuid: string) => void;
  workingHours: { start: number; end: number }; // например { start: 9, end: 18 }
}

// Расстояние между часами в пикселях: gap (50px) + высота строки времени (13px)
const TIME_ROW_HEIGHT = 13;
const TIME_ROW_GAP = 50;
const PIXELS_PER_HOUR = TIME_ROW_HEIGHT + TIME_ROW_GAP; // 13 + 50 = 63px
// Пикселей на минуту
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60; // 63 / 60 = 1.05
const DAY_COLUMN_WIDTH = 120; // ширина колонки для одного дня
const DAY_COLUMN_GAP = 12; // отступ между колонками дней

interface BookingWithPosition extends AdminBookingResponseDto {
  top: number;
  height: number;
  dayIndex: number;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  bookings,
  weekStart,
  onBookingClick,
  workingHours,
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
    const top = minutesFromStart * PIXELS_PER_MINUTE;

    // Рассчитываем высоту карточки
    const durationMinutes = differenceInMinutes(endTime, startTime);
    const height = durationMinutes * PIXELS_PER_MINUTE;

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

  return (
    <div className="calendar-grid">
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
          {/* Горизонтальные линии для каждого часа */}
          <div className="calendar-grid__horizontal-lines">
            {hours.map((hour) => (
              <div key={hour} className="calendar-grid__hour-line" />
            ))}
          </div>

          {/* Вертикальные линии для каждого дня */}
          <div className="calendar-grid__vertical-lines">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div key={dayIndex} className="calendar-grid__day-line" />
            ))}
          </div>

          {/* Карточки заказов */}
          <div className="calendar-grid__bookings">
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
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;

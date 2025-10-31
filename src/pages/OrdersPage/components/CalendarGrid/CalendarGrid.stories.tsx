import type { Meta, StoryObj } from '@storybook/react';
import { startOfWeek } from 'date-fns';
import CalendarGrid from './CalendarGrid';
import { DetailedBookingResponseDto } from '../../../../../services/api-client';

const meta = {
  title: 'Pages/Orders/CalendarGrid',
  component: CalendarGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CalendarGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Функция для создания тестового заказа
const createBooking = (
  uuid: string,
  serviceName: string,
  dayOffset: number,
  startHour: number,
  startMinute: number,
  durationMinutes: number,
  status: DetailedBookingResponseDto['status'] = 'completed'
): DetailedBookingResponseDto => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const startDate = new Date(weekStart);
  startDate.setDate(startDate.getDate() + dayOffset);
  startDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);

  return {
    uuid,
    client_uuid: 'client-1',
    car_uuid: 'car-1',
    service_center_uuid: 'sc-1',
    service_uuid: 'service-1',
    serviceCenterName: 'Тестовый СЦ',
    serviceCenterAddress: 'ул. Тестовая, 1',
    serviceBusinessType: 'car_wash',
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    status,
    total_cost: 1000,
    payment_status: 'paid',
    payment_method: 'card',
    client_comment: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      uuid: 'client-1',
      name: null,
      phone: '+79991234567',
      email: null,
    },
    car: {
      uuid: 'car-1',
      make: 'Toyota',
      model: 'Camry',
      class: 'sedan',
      license_plate: null,
    },
    service_center: {
      uuid: 'sc-1',
      name: 'Тестовый СЦ',
      address: 'ул. Тестовая, 1',
      logo_url: null,
    },
    service: {
      uuid: 'service-1',
      name: serviceName,
      description: 'Описание услуги',
      price: 1000,
      duration_minutes: durationMinutes,
      category: 'wash',
    },
  };
};

// Тестовые данные для разных сценариев
const testBookings: DetailedBookingResponseDto[] = [
  // Понедельник
  createBooking('1', 'Эконом мойка', 0, 9, 0, 30, 'completed'),
  createBooking('2', 'Эконом мойка', 0, 12, 0, 45, 'completed'),
  createBooking('3', 'Эконом мойка', 0, 14, 0, 60, 'completed'),
  createBooking('4', 'Эконом мойка', 0, 16, 0, 45, 'completed'),

  // Вторник
  createBooking('5', 'Эконом мойка', 1, 9, 0, 30, 'completed'),
  createBooking('6', 'Эконом мойка', 1, 10, 0, 45, 'completed'),
  createBooking('7', 'Эконом мойка', 1, 12, 0, 45, 'completed'),
  createBooking('8', 'Эконом мойка', 1, 14, 0, 30, 'completed'),

  // Среда
  createBooking('9', 'Эконом мойка', 2, 10, 0, 45, 'completed'),
  createBooking('10', 'Эконом мойка', 2, 11, 0, 45, 'completed'),
  createBooking('11', 'Эконом мойка', 2, 13, 0, 30, 'completed'),
  createBooking('12', 'Эконом мойка', 2, 14, 0, 30, 'completed'),

  // Четверг
  createBooking('13', 'Эконом мойка', 3, 9, 0, 30, 'completed'),
  createBooking('14', 'Эконом мойка', 3, 10, 0, 45, 'completed'),
  createBooking('15', 'Эконом мойка', 3, 13, 0, 30, 'completed'),
  createBooking('16', 'Эконом мойка', 3, 14, 0, 30, 'completed'),

  // Пятница
  createBooking('17', 'Полная мойка', 4, 9, 0, 60, 'confirmed'),
  createBooking('18', 'Полная мойка', 4, 11, 0, 60, 'confirmed'),

  // Суббота
  createBooking('19', 'Полная мойка', 5, 10, 0, 90, 'confirmed'),
  createBooking('20', 'Эконом мойка', 5, 13, 0, 45, 'completed'),

  // Воскресенье
  createBooking('21', 'Полная мойка', 6, 11, 0, 60, 'pending_confirmation'),
];

export const Default: Story = {
  args: {
    bookings: testBookings,
    weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    onBookingClick: (bookingUuid: string) => {
      console.log('Clicked booking:', bookingUuid);
      alert(`Clicked booking: ${bookingUuid}`);
    },
    workingHours: { start: 9, end: 18 },
  },
};

export const EmptyCalendar: Story = {
  args: {
    bookings: [],
    weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    onBookingClick: (bookingUuid: string) => {
      console.log('Clicked booking:', bookingUuid);
    },
    workingHours: { start: 9, end: 18 },
  },
};

export const Loading: Story = {
  args: {
    bookings: [],
    weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    onBookingClick: (bookingUuid: string) => {
      console.log('Clicked booking:', bookingUuid);
    },
    workingHours: { start: 9, end: 18 },
    isLoading: true,
  },
};

export const BusyDay: Story = {
  args: {
    bookings: [
      createBooking('1', 'Эконом мойка', 2, 9, 0, 30, 'completed'),
      createBooking('2', 'Полная мойка', 2, 9, 45, 60, 'completed'),
      createBooking('3', 'Эконом мойка', 2, 11, 0, 45, 'completed'),
      createBooking('4', 'Полная мойка', 2, 12, 0, 90, 'confirmed'),
      createBooking('5', 'Эконом мойка', 2, 14, 0, 30, 'completed'),
      createBooking('6', 'Полная мойка', 2, 15, 0, 60, 'confirmed'),
      createBooking('7', 'Эконом мойка', 2, 16, 30, 45, 'pending_confirmation'),
    ],
    weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    onBookingClick: (bookingUuid: string) => {
      console.log('Clicked booking:', bookingUuid);
    },
    workingHours: { start: 9, end: 18 },
  },
};

export const DifferentStatuses: Story = {
  args: {
    bookings: [
      createBooking('1', 'Эконом мойка', 2, 9, 0, 45, 'completed'),
      createBooking('2', 'Полная мойка', 2, 10, 0, 60, 'confirmed'),
      createBooking('3', 'Эконом мойка', 2, 12, 0, 45, 'pending_confirmation'),
      createBooking('4', 'Полная мойка', 2, 14, 0, 60, 'cancelled'),
    ],
    weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    onBookingClick: (bookingUuid: string) => {
      console.log('Clicked booking:', bookingUuid);
    },
    workingHours: { start: 9, end: 18 },
  },
};

export const ExtendedWorkingHours: Story = {
  args: {
    bookings: [
      createBooking('1', 'Эконом мойка', 2, 8, 0, 30, 'completed'),
      createBooking('2', 'Полная мойка', 2, 10, 0, 60, 'confirmed'),
      createBooking('3', 'Эконом мойка', 2, 14, 0, 45, 'completed'),
      createBooking('4', 'Полная мойка', 2, 19, 0, 60, 'confirmed'),
    ],
    weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    onBookingClick: (bookingUuid: string) => {
      console.log('Clicked booking:', bookingUuid);
    },
    workingHours: { start: 8, end: 20 },
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import EditBookingModal from './EditBookingModal';
import { bookingsStore } from '../../../../stores';
import type { DetailedBookingResponseDto } from '../../../../../services/api-client';

// Мок данных бронирования
const mockBookingData: DetailedBookingResponseDto = {
  uuid: 'test-uuid-123',
  client_uuid: 'client-123',
  car_uuid: 'car-123',
  service_center_uuid: 'sc-123',
  service_uuid: 'service-123',
  serviceCenterName: 'Автосервис "Профи"',
  serviceCenterAddress: 'ул. Примерная, 123',
  serviceBusinessType: 'car_wash',
  start_time: '2024-10-20T09:00:00Z',
  end_time: '2024-10-20T10:00:00Z',
  status: 'pending_confirmation',
  total_cost: 1500,
  payment_status: 'pending',
  payment_method: null,
  client_comment: null,
  created_at: '2024-10-18T10:00:00Z',
  updated_at: '2024-10-18T10:00:00Z',
  client: {
    uuid: 'client-123',
    name: null,
    phone: '+79991234567',
    email: null,
  },
  car: {
    uuid: 'car-123',
    make: 'Audi',
    model: 'R8',
    class: 'sedan',
    license_plate: {
      number: 'A000AA',
      region: '111',
    },
  },
  service_center: {
    uuid: 'sc-123',
    name: 'Автосервис "Профи"',
    address: 'ул. Примерная, 123',
    logo_url: null,
  },
  service: {
    uuid: 'service-123',
    name: 'Эконом мойка',
    description: 'Базовая мойка автомобиля',
    price: 1000,
    duration_minutes: 60,
    category: 'Мойка',
  },
  additionalServices: [
    {
      uuid: 'add-service-123',
      name: 'Чернение шин',
      description: null,
      price: 500,
      duration_minutes: 15,
      category: 'Дополнительно',
    },
  ],
};

const meta = {
  title: 'Pages/Orders/EditBookingModal',
  component: EditBookingModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Мокаем метод fetchBookingDetails
      const originalFetch = bookingsStore.fetchBookingDetails;
      
      bookingsStore.fetchBookingDetails = async () => {
        // Эмулируем задержку загрузки
        await new Promise(resolve => setTimeout(resolve, 300));
        bookingsStore.selectedBooking = mockBookingData;
      };

      return (
        <>
          <Story />
          {/* Восстанавливаем оригинальный метод после рендера (cleanup не нужен в Stories) */}
          <div style={{ display: 'none' }} ref={() => {
            bookingsStore.fetchBookingDetails = originalFetch;
          }} />
        </>
      );
    },
  ],
} satisfies Meta<typeof EditBookingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    startHour: 9,
    endHour: 18,
    bookingUuid: 'test-uuid-123',
    onClose: fn(),
    onUpdate: fn(),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    startHour: 9,
    endHour: 18,
    bookingUuid: 'test-uuid-123',
    onClose: fn(),
    onUpdate: fn(),
  },
};

export const ConfirmedStatus: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story) => {
      const originalFetch = bookingsStore.fetchBookingDetails;
      
      bookingsStore.fetchBookingDetails = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        bookingsStore.selectedBooking = {
          ...mockBookingData,
          status: 'confirmed',
        };
      };

      return (
        <>
          <Story />
          <div style={{ display: 'none' }} ref={() => {
            bookingsStore.fetchBookingDetails = originalFetch;
          }} />
        </>
      );
    },
  ],
};

export const CompletedStatus: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story) => {
      const originalFetch = bookingsStore.fetchBookingDetails;
      
      bookingsStore.fetchBookingDetails = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        bookingsStore.selectedBooking = {
          ...mockBookingData,
          status: 'completed',
        };
      };

      return (
        <>
          <Story />
          <div style={{ display: 'none' }} ref={() => {
            bookingsStore.fetchBookingDetails = originalFetch;
          }} />
        </>
      );
    },
  ],
};

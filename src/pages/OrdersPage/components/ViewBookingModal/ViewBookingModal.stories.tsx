import type { Meta, StoryObj } from '@storybook/react';
import ViewBookingModal from './ViewBookingModal';
import type { DetailedBookingResponseDto } from '../../../../../services/api-client';
import { bookingsStore } from '../../../../stores/BookingsStore';

const meta: Meta<typeof ViewBookingModal> = {
  title: 'Pages/OrdersPage/ViewBookingModal',
  component: ViewBookingModal,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '800px', height: '600px', background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ViewBookingModal>;

// Mock данные для бронирования
const mockBooking: DetailedBookingResponseDto = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  client_uuid: 'client-uuid',
  car_uuid: 'car-uuid',
  service_center_uuid: 'sc-uuid',
  service_uuid: 'service-uuid',
  serviceCenterName: 'Автосервис №1',
  serviceCenterAddress: 'ул. Ленина, 1',
  serviceBusinessType: 'car_wash',
  start_time: '2024-09-25T19:30:00.000Z',
  end_time: '2024-09-25T20:30:00.000Z',
  status: 'confirmed',
  total_cost: 600,
  payment_status: 'pending',
  payment_method: null,
  client_comment: null,
  created_at: '2024-09-20T10:00:00.000Z',
  updated_at: '2024-09-20T10:00:00.000Z',
  client: {
    uuid: 'client-uuid',
    name: { first: 'Иван', last: 'Иванов' },
    phone: '+79991234567',
    email: null,
  },
  car: {
    uuid: 'car-uuid',
    make: 'Toyota',
    model: 'Camry',
    class: 'sedan',
    license_plate: { number: 'A000AA', region: '111' },
  },
  service_center: {
    uuid: 'sc-uuid',
    name: 'Автосервис №1',
    address: 'ул. Ленина, 1',
    logo_url: null,
  },
  service: {
    uuid: 'service-uuid',
    name: 'Эконом мойка',
    description: 'Быстрая мойка автомобиля',
    price: 600,
    duration_minutes: 40,
    category: 'Мойка',
  },
};

const mockBookingWithAdditionalServices: DetailedBookingResponseDto = {
  ...mockBooking,
  additionalServices: [
    {
      uuid: 'additional-1',
      name: 'Пылесос',
      description: 'Чистка салона пылесосом',
      price: 1000,
      duration_minutes: 60,
      category: 'Дополнительные услуги',
    },
  ],
};

// Story для модального окна по умолчанию (закрыто)
export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
};

// Story для открытого модального окна со статусом "Подтвержден"
export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    // Мокаем данные в store
    bookingsStore.selectedBooking = mockBooking;
    bookingsStore.isLoadingDetails = false;
  },
};

// Story для статуса "Ожидает"
export const PendingStatus: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      status: 'pending_confirmation',
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story для статуса "Завершено"
export const CompletedStatus: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      status: 'completed',
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story для статуса "Отменён"
export const CancelledStatus: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      status: 'cancelled',
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story с дополнительными услугами
export const WithAdditionalServices: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBookingWithAdditionalServices.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = mockBookingWithAdditionalServices;
    bookingsStore.isLoadingDetails = false;
  },
};

// Story для состояния загрузки
export const Loading: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = null;
    bookingsStore.isLoadingDetails = true;
  },
};

// Story с комментарием клиента
export const WithComment: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      client_comment: 'Без воска, только стандартная мойка.' as unknown as { [key: string]: unknown },
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story для режима "Новая запись" (showAsNewBooking)
export const NewBooking: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
    showAsNewBooking: true,
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      status: 'pending_confirmation',
      client_comment: 'Без воска, только стандартная мойка.' as unknown as { [key: string]: unknown },
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story для режима "Новая запись" с счетчиком (несколько pending заказов)
export const NewBookingWithCounter: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
    showAsNewBooking: true,
    pendingCount: 3,
    currentPendingIndex: 0,
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      status: 'pending_confirmation',
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story для второго pending заказа из трех
export const NewBookingSecondOfThree: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
    showAsNewBooking: true,
    pendingCount: 3,
    currentPendingIndex: 1,
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      status: 'pending_confirmation',
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story с изображением автомобиля
export const WithCarImage: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      car: {
        ...mockBooking.car,
        // Используем относительный путь - будет добавлен VITE_BASE_STATIC_PATH автоматически
        generated_image: '/uploads/cars/toyota-camry-example.jpg',
      } as unknown as typeof mockBooking.car,
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story без изображения автомобиля (по умолчанию показывает placeholder)
export const WithoutCarImage: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      car: {
        ...mockBooking.car,
        generated_image: null,
      } as unknown as typeof mockBooking.car,
    };
    bookingsStore.isLoadingDetails = false;
  },
};

// Story с номером автомобиля в строковом формате (как в AdminBookingCarDto)
export const WithStringLicensePlate: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    bookingUuid: mockBooking.uuid,
    onUpdate: () => console.log('Update bookings'),
  },
  play: async () => {
    bookingsStore.selectedBooking = {
      ...mockBooking,
      car: {
        ...mockBooking.car,
        license_plate: 'А123ВС 77',
        generated_image: '/uploads/cars/toyota-camry.jpg',
      } as unknown as typeof mockBooking.car,
    };
    bookingsStore.isLoadingDetails = false;
  },
};

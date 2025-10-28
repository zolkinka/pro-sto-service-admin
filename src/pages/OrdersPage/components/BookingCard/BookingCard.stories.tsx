import type { Meta, StoryObj } from '@storybook/react';
import BookingCard from './BookingCard';
import { DetailedBookingResponseDto } from '../../../../../services/api-client';

// Mock данные для бронирования
const createMockBooking = (
  status: DetailedBookingResponseDto['status'],
  serviceName: string = 'Эконом мойка',
  startTime: string = '2024-10-25T09:00:00Z',
  endTime: string = '2024-10-25T10:00:00Z'
): DetailedBookingResponseDto => ({
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  client_uuid: '123e4567-e89b-12d3-a456-426614174001',
  car_uuid: '123e4567-e89b-12d3-a456-426614174002',
  service_center_uuid: '123e4567-e89b-12d3-a456-426614174003',
  service_uuid: '123e4567-e89b-12d3-a456-426614174004',
  serviceCenterName: 'Автомойка №1',
  serviceCenterAddress: 'ул. Примерная, 1',
  serviceBusinessType: 'car_wash',
  start_time: startTime,
  end_time: endTime,
  status,
  total_cost: 500,
  payment_status: 'pending',
  payment_method: null,
  client_comment: null,
  created_at: '2024-10-25T08:00:00Z',
  updated_at: '2024-10-25T08:00:00Z',
  client: {
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    name: { first: 'Иван', last: 'Иванов' },
    phone: '+79001234567',
    email: null,
  },
  car: {
    uuid: '123e4567-e89b-12d3-a456-426614174002',
    make: 'Audi',
    model: 'R8',
    class: 'Premium',
    license_plate: { number: 'A000AA', region: '111' },
  },
  service_center: {
    uuid: '123e4567-e89b-12d3-a456-426614174003',
    name: 'Автомойка №1',
    address: 'ул. Примерная, 1',
    logo_url: null,
  },
  service: {
    uuid: '123e4567-e89b-12d3-a456-426614174004',
    name: serviceName,
    description: 'Стандартная мойка автомобиля',
    price: 500,
    duration_minutes: 60,
    category: 'Мойка',
  },
  additionalServices: [],
});

const meta: Meta<typeof BookingCard> = {
  title: 'Pages/OrdersPage/BookingCard',
  component: BookingCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Компонент карточки заказа для отображения в календаре.

## Особенности
- Отображение названия услуги, времени и статуса
- Цветовая индикация по статусам
- Hover-эффект с увеличением и тенью
- Поддержка клавиатурной навигации (Enter/Space)
- Accessibility атрибуты (role, tabIndex, aria-label)

## Статусы и цвета
- **completed** (Выполнен): зеленый фон (#DEF7E7), текст #0AB878
- **confirmed** (Ожидает): желтый фон (#F9ECD2), текст #CC8D18
- **pending_confirmation** (Ожидает): желтый фон (#F9ECD2), текст #CC8D18
- **cancelled** (Отменён): серый фон (#F4F3F0), текст #888684

## Использование
\`\`\`tsx
<BookingCard
  booking={detailedBookingData}
  onClick={() => console.log('Clicked')}
  style={{ position: 'absolute', top: '100px', left: '50px' }}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    booking: {
      description: 'Данные бронирования',
      table: {
        type: { summary: 'DetailedBookingResponseDto' },
      },
    },
    onClick: {
      description: 'Обработчик клика на карточку',
      action: 'clicked',
      table: {
        type: { summary: '() => void' },
      },
    },
    style: {
      description: 'Дополнительные CSS-стили (для position/top/left/height)',
      table: {
        type: { summary: 'React.CSSProperties' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BookingCard>;

/**
 * Карточка со статусом "Выполнен"
 */
export const Completed: Story = {
  args: {
    booking: createMockBooking('completed', 'Эконом мойка'),
    onClick: () => console.log('Completed booking clicked'),
  },
};

/**
 * Карточка со статусом "Ожидает" (confirmed)
 */
export const Confirmed: Story = {
  args: {
    booking: createMockBooking('confirmed', 'Эконом мойка'),
    onClick: () => console.log('Confirmed booking clicked'),
  },
};

/**
 * Карточка со статусом "Ожидает" (pending_confirmation)
 */
export const PendingConfirmation: Story = {
  args: {
    booking: createMockBooking('pending_confirmation', 'Эконом мойка'),
    onClick: () => console.log('Pending confirmation booking clicked'),
  },
};

/**
 * Карточка со статусом "Отменён"
 */
export const Cancelled: Story = {
  args: {
    booking: createMockBooking('cancelled', 'Эконом мойка'),
    onClick: () => console.log('Cancelled booking clicked'),
  },
};

/**
 * Карточка с длинным названием услуги
 */
export const LongServiceName: Story = {
  args: {
    booking: createMockBooking(
      'completed',
      'Комплексная мойка кузова с полировкой и чернением резины'
    ),
    onClick: () => console.log('Long name booking clicked'),
  },
};

/**
 * Карточка с коротким временем (30 минут)
 */
export const ShortDuration: Story = {
  args: {
    booking: createMockBooking(
      'completed',
      'Экспресс-мойка',
      '2024-10-25T09:00:00Z',
      '2024-10-25T09:30:00Z'
    ),
    onClick: () => console.log('Short duration booking clicked'),
  },
};

/**
 * Карточка с длительным временем (2 часа)
 */
export const LongDuration: Story = {
  args: {
    booking: createMockBooking(
      'confirmed',
      'Детейлинг',
      '2024-10-25T14:00:00Z',
      '2024-10-25T16:00:00Z'
    ),
    onClick: () => console.log('Long duration booking clicked'),
  },
};

/**
 * Все статусы в сравнении
 */
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <BookingCard
        booking={createMockBooking('completed', 'Эконом мойка')}
        onClick={() => console.log('Completed')}
      />
      <BookingCard
        booking={createMockBooking('confirmed', 'Эконом мойка')}
        onClick={() => console.log('Confirmed')}
      />
      <BookingCard
        booking={createMockBooking('pending_confirmation', 'Эконом мойка')}
        onClick={() => console.log('Pending')}
      />
      <BookingCard
        booking={createMockBooking('cancelled', 'Эконом мойка')}
        onClick={() => console.log('Cancelled')}
      />
    </div>
  ),
};

/**
 * Карточки с разным временем
 */
export const DifferentTimes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <BookingCard
        booking={createMockBooking(
          'completed',
          'Утренняя',
          '2024-10-25T09:00:00Z',
          '2024-10-25T10:00:00Z'
        )}
        onClick={() => console.log('Morning')}
      />
      <BookingCard
        booking={createMockBooking(
          'confirmed',
          'Дневная',
          '2024-10-25T12:00:00Z',
          '2024-10-25T13:00:00Z'
        )}
        onClick={() => console.log('Afternoon')}
      />
      <BookingCard
        booking={createMockBooking(
          'pending_confirmation',
          'Вечерняя',
          '2024-10-25T16:00:00Z',
          '2024-10-25T17:00:00Z'
        )}
        onClick={() => console.log('Evening')}
      />
    </div>
  ),
};

/**
 * Симуляция календарной сетки
 */
export const CalendarGrid: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: '600px',
        height: '400px',
        background: '#F9F8F5',
        borderRadius: '16px',
        padding: '16px',
      }}
    >
      <BookingCard
        booking={createMockBooking('completed', 'Эконом мойка')}
        onClick={() => console.log('Card 1')}
        style={{ position: 'absolute', top: '20px', left: '20px' }}
      />
      <BookingCard
        booking={createMockBooking('confirmed', 'Полная мойка')}
        onClick={() => console.log('Card 2')}
        style={{ position: 'absolute', top: '20px', left: '160px' }}
      />
      <BookingCard
        booking={createMockBooking('pending_confirmation', 'Детейлинг')}
        onClick={() => console.log('Card 3')}
        style={{ position: 'absolute', top: '110px', left: '20px' }}
      />
      <BookingCard
        booking={createMockBooking('cancelled', 'Экспресс')}
        onClick={() => console.log('Card 4')}
        style={{ position: 'absolute', top: '110px', left: '160px' }}
      />
      <BookingCard
        booking={createMockBooking('completed', 'Мойка + полировка')}
        onClick={() => console.log('Card 5')}
        style={{ position: 'absolute', top: '200px', left: '20px', height: '100px' }}
      />
    </div>
  ),
};

/**
 * Интерактивная карточка с разными услугами
 */
export const InteractiveServices: Story = {
  render: () => {
    const services = [
      'Эконом мойка',
      'Стандарт мойка',
      'Премиум мойка',
      'Детейлинг',
      'Полировка',
      'Химчистка салона',
    ];

    return (
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {services.map((service, index) => (
          <BookingCard
            key={index}
            booking={createMockBooking(
              index % 2 === 0 ? 'completed' : 'confirmed',
              service
            )}
            onClick={() => console.log(`Clicked: ${service}`)}
          />
        ))}
      </div>
    );
  },
};

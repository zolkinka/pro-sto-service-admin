import type { Meta, StoryObj } from '@storybook/react';
import OrdersPage from './OrdersPage';

const meta: Meta<typeof OrdersPage> = {
  title: 'Pages/OrdersPage',
  component: OrdersPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof OrdersPage>;

export const Default: Story = {};

export const WithMockData: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/admin/bookings',
        method: 'GET',
        status: 200,
        response: {
          data: [
            {
              uuid: '1',
              client_uuid: 'client-1',
              car_uuid: 'car-1',
              service_center_uuid: 'center-1',
              service_uuid: 'service-1',
              start_time: new Date(2024, 10, 28, 10, 0).toISOString(),
              end_time: new Date(2024, 10, 28, 11, 0).toISOString(),
              status: 'confirmed',
              total_cost: 1500,
              payment_status: 'pending',
              payment_method: null,
              client: {
                uuid: 'client-1',
                name: 'Иван Иванов',
                phone: '+79991234567',
              },
              car: {
                uuid: 'car-1',
                make: 'Toyota',
                model: 'Camry',
                year: 2020,
                license_plate: { number: 'А123ВС', region: '77' },
              },
              service: {
                uuid: 'service-1',
                name: 'Замена масла',
                duration_minutes: 60,
              },
            },
            {
              uuid: '2',
              client_uuid: 'client-2',
              car_uuid: 'car-2',
              service_center_uuid: 'center-1',
              service_uuid: 'service-2',
              start_time: new Date(2024, 10, 28, 14, 0).toISOString(),
              end_time: new Date(2024, 10, 28, 15, 0).toISOString(),
              status: 'pending_confirmation',
              total_cost: 2500,
              payment_status: 'pending',
              payment_method: null,
              client: {
                uuid: 'client-2',
                name: 'Петр Петров',
                phone: '+79991234568',
              },
              car: {
                uuid: 'car-2',
                make: 'BMW',
                model: 'X5',
                year: 2022,
                license_plate: { number: 'Е456КХ', region: '99' },
              },
              service: {
                uuid: 'service-2',
                name: 'Диагностика',
                duration_minutes: 60,
              },
            },
          ],
          total: 2,
        },
      },
    ],
  },
};

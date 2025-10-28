import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Meta, StoryObj } from '@storybook/react';
import { BookingsStore } from './BookingsStore';
import type { AdminBookingResponseDto } from '../../services/api-client';
import styled from 'styled-components';

// Создаем styled компоненты для отображения
const Container = styled.div`
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
  color: #1a1a1a;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
`;

const Label = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${({ status }) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'pending_confirmation':
        return '#ff9800';
      case 'completed':
        return '#2196f3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }};
  color: white;
`;

const BookingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const BookingCard = styled.div`
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
`;

const BookingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

// Компонент для демонстрации работы Store
const BookingsStoreDemo = observer(({ store }: { store: BookingsStore }) => {
  useEffect(() => {
    // Инициализируем store
    store.setServiceCenterUuid('demo-service-center-uuid');
    // В реальном приложении здесь был бы вызов fetchBookings()
  }, [store]);

  return (
    <Container>
      <Section>
        <Title>Store State</Title>
        <Grid>
          <Card>
            <Label>Total Bookings</Label>
            <Value>{store.bookings.length}</Value>
          </Card>
          <Card>
            <Label>Loading</Label>
            <Value>{store.isLoading ? 'Yes' : 'No'}</Value>
          </Card>
          <Card>
            <Label>Total Revenue</Label>
            <Value>{store.totalRevenue.toLocaleString('ru-RU')} ₽</Value>
          </Card>
          <Card>
            <Label>Service Center UUID</Label>
            <Value style={{ fontSize: '12px', wordBreak: 'break-all' }}>
              {store.serviceCenterUuid || 'Not set'}
            </Value>
          </Card>
        </Grid>
      </Section>

      <Section>
        <Title>Status Statistics</Title>
        <Grid>
          <Card>
            <Label>Pending Confirmation</Label>
            <Value>{store.statusStats.pending_confirmation}</Value>
          </Card>
          <Card>
            <Label>Confirmed</Label>
            <Value>{store.statusStats.confirmed}</Value>
          </Card>
          <Card>
            <Label>Completed</Label>
            <Value>{store.statusStats.completed}</Value>
          </Card>
          <Card>
            <Label>Cancelled</Label>
            <Value>{store.statusStats.cancelled}</Value>
          </Card>
        </Grid>
      </Section>

      <Section>
        <Title>Date Filters</Title>
        <Grid>
          <Card>
            <Label>Date From</Label>
            <Value>{store.dateFrom.toLocaleDateString('ru-RU')}</Value>
          </Card>
          <Card>
            <Label>Date To</Label>
            <Value>{store.dateTo.toLocaleDateString('ru-RU')}</Value>
          </Card>
          <Card>
            <Label>Selected Statuses</Label>
            <Value>
              {store.selectedStatuses.length === 0
                ? 'All'
                : store.selectedStatuses.join(', ')}
            </Value>
          </Card>
        </Grid>
      </Section>

      <Section>
        <Title>Bookings ({store.bookings.length})</Title>
        {store.bookings.length === 0 ? (
          <Card>
            <Value style={{ textAlign: 'center', color: '#999' }}>
              No bookings to display. Call fetchBookings() to load data from API.
            </Value>
          </Card>
        ) : (
          <BookingsList>
            {store.bookings.map((booking) => (
              <BookingCard key={booking.uuid}>
                <BookingRow>
                  <div>
                    <strong>{booking.client.name}</strong> - {booking.car.make}{' '}
                    {booking.car.model}
                  </div>
                  <StatusBadge status={booking.status}>{booking.status}</StatusBadge>
                </BookingRow>
                <BookingRow>
                  <div>
                    <small>
                      {new Date(booking.start_time).toLocaleString('ru-RU')} -{' '}
                      {new Date(booking.end_time).toLocaleTimeString('ru-RU')}
                    </small>
                  </div>
                  <div>
                    <strong>{booking.total_cost.toLocaleString('ru-RU')} ₽</strong>
                  </div>
                </BookingRow>
                <div style={{ marginTop: '8px' }}>
                  <small style={{ color: '#666' }}>{booking.service.name}</small>
                </div>
              </BookingCard>
            ))}
          </BookingsList>
        )}
      </Section>

      <Section>
        <Title>Computed Properties</Title>
        <Card>
          <Label>Bookings by Date (Map size)</Label>
          <Value>{store.bookingsByDate.size} dates</Value>
        </Card>
        <Card style={{ marginTop: '16px' }}>
          <Label>Bookings by Time Slot (Map size)</Label>
          <Value>{store.bookingsByTimeSlot.size} time slots</Value>
        </Card>
      </Section>
    </Container>
  );
});

const meta: Meta<typeof BookingsStoreDemo> = {
  title: 'Stores/BookingsStore',
  component: BookingsStoreDemo,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof BookingsStoreDemo>;

export const EmptyStore: Story = {
  args: {
    store: new BookingsStore(),
  },
};

export const WithMockData: Story = {
  args: {
    store: (() => {
      const store = new BookingsStore();
      store.setServiceCenterUuid('demo-service-center-uuid');
      
      // Заполняем моковыми данными для демонстрации (напрямую для story)
      (store.bookings as AdminBookingResponseDto[]) = [
        {
          uuid: '1',
          client_uuid: 'client-1',
          car_uuid: 'car-1',
          service_center_uuid: 'sc-1',
          service_uuid: 'service-1',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          status: 'confirmed',
          total_cost: 1500,
          payment_status: 'paid',
          payment_method: null,
          client: {
            uuid: 'client-1',
            name: 'Иван Петров',
            phone: '+79991234567',
          },
          car: {
            uuid: 'car-1',
            make: 'BMW',
            model: 'X5',
            license_plate: 'A123BC',
            class: 'suv',
          },
          service: {
            uuid: 'service-1',
            name: 'Комплексная мойка',
            duration_minutes: 60,
          },
          additionalServices: [],
        },
        {
          uuid: '2',
          client_uuid: 'client-2',
          car_uuid: 'car-2',
          service_center_uuid: 'sc-1',
          service_uuid: 'service-2',
          start_time: new Date(Date.now() + 7200000).toISOString(),
          end_time: new Date(Date.now() + 10800000).toISOString(),
          status: 'pending_confirmation',
          total_cost: 2500,
          payment_status: 'pending',
          payment_method: null,
          client: {
            uuid: 'client-2',
            name: 'Мария Сидорова',
            phone: '+79997654321',
          },
          car: {
            uuid: 'car-2',
            make: 'Mercedes',
            model: 'E-Class',
            license_plate: 'B456DE',
            class: 'sedan',
          },
          service: {
            uuid: 'service-2',
            name: 'Премиум мойка + полировка',
            duration_minutes: 90,
          },
          additionalServices: [],
        },
        {
          uuid: '3',
          client_uuid: 'client-3',
          car_uuid: 'car-3',
          service_center_uuid: 'sc-1',
          service_uuid: 'service-3',
          start_time: new Date(Date.now() - 86400000).toISOString(),
          end_time: new Date(Date.now() - 82800000).toISOString(),
          status: 'completed',
          total_cost: 1200,
          payment_status: 'paid',
          payment_method: null,
          client: {
            uuid: 'client-3',
            name: 'Алексей Иванов',
            phone: '+79995551234',
          },
          car: {
            uuid: 'car-3',
            make: 'Audi',
            model: 'A4',
            license_plate: 'C789FG',
            class: 'sedan',
          },
          service: {
            uuid: 'service-3',
            name: 'Экспресс мойка',
            duration_minutes: 30,
          },
          additionalServices: [],
        },
      ];
      
      return store;
    })(),
  },
};

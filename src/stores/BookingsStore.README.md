# BookingsStore

MobX store для управления бронированиями (заказами) в админ-панели.

## Описание

BookingsStore предоставляет централизованное управление состоянием бронирований, включая загрузку, фильтрацию, обновление и изменение статусов заказов.

## Основные возможности

- ✅ Загрузка списка бронирований с API
- ✅ Загрузка детальной информации о бронировании
- ✅ Фильтрация по датам и статусам
- ✅ Обновление данных бронирования
- ✅ Изменение статуса бронирования
- ✅ Группировка по датам и временным слотам
- ✅ Статистика по статусам и выручке

## Использование

### Инициализация

```typescript
import { bookingsStore } from '@/stores';

// Установить UUID сервисного центра
bookingsStore.setServiceCenterUuid('your-service-center-uuid');
```

### Загрузка бронирований

```typescript
// Загрузить бронирования за текущий диапазон дат
await bookingsStore.fetchBookings();

// Установить свой диапазон дат
bookingsStore.setDateRange(
  new Date('2025-10-27'),
  new Date('2025-11-02')
);
await bookingsStore.fetchBookings();
```

### Фильтрация по статусам

```typescript
// Фильтр по конкретным статусам
bookingsStore.setSelectedStatuses(['confirmed', 'pending_confirmation']);
await bookingsStore.fetchBookings();

// Показать все статусы
bookingsStore.setSelectedStatuses([]);
await bookingsStore.fetchBookings();
```

### Работа с детальной информацией

```typescript
// Загрузить детали конкретного бронирования
await bookingsStore.fetchBookingDetails('booking-uuid');

// Получить выбранное бронирование
const booking = bookingsStore.selectedBooking;

// Очистить выбранное бронирование
bookingsStore.clearSelectedBooking();
```

### Обновление бронирования

```typescript
// Изменить статус
const success = await bookingsStore.updateBookingStatus(
  'booking-uuid',
  'confirmed'
);

// Обновить данные бронирования
const updated = await bookingsStore.updateBooking('booking-uuid', {
  start_time: '2025-10-28T10:00:00Z',
  service_uuid: 'new-service-uuid',
  additionalServiceUuids: ['additional-1', 'additional-2'],
  client_comment: 'Новый комментарий',
});
```

### Использование computed свойств

```typescript
// Получить группировку по датам
const bookingsByDate = bookingsStore.bookingsByDate;
bookingsByDate.forEach((bookings, date) => {
  console.log(`${date}: ${bookings.length} bookings`);
});

// Получить бронирования для конкретной даты
const todayBookings = bookingsStore.getBookingsForDate(new Date());

// Получить бронирования для временного слота
const morningBookings = bookingsStore.getBookingsForTimeSlot(
  new Date(),
  '09:00'
);

// Статистика по статусам
const stats = bookingsStore.statusStats;
console.log(`Подтверждено: ${stats.confirmed}`);

// Общая выручка
const revenue = bookingsStore.totalRevenue;
console.log(`Выручка: ${revenue} ₽`);
```

## React компонент с MobX

```typescript
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks';

const BookingsPage = observer(() => {
  const { bookingsStore } = useStores();

  useEffect(() => {
    bookingsStore.setServiceCenterUuid('sc-uuid');
    bookingsStore.fetchBookings();
  }, []);

  if (bookingsStore.isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h1>Заказы ({bookingsStore.bookings.length})</h1>
      <p>Выручка: {bookingsStore.totalRevenue} ₽</p>
      
      {bookingsStore.bookings.map((booking) => (
        <div key={booking.uuid}>
          {booking.client.name} - {booking.service.name}
        </div>
      ))}
    </div>
  );
});
```

## API методы

### State

- `bookings: AdminBookingResponseDto[]` - список бронирований
- `selectedBooking: DetailedBookingResponseDto | null` - выбранное бронирование
- `isLoading: boolean` - состояние загрузки списка
- `isLoadingDetails: boolean` - состояние загрузки деталей
- `error: string | null` - ошибка
- `dateFrom: Date` - начало диапазона дат
- `dateTo: Date` - конец диапазона дат
- `selectedStatuses: BookingStatus[]` - выбранные статусы для фильтрации
- `serviceCenterUuid: string | null` - UUID сервисного центра
- `total: number` - общее количество бронирований
- `limit: number` - лимит записей (default: 100)
- `offset: number` - смещение для пагинации

### Actions

- `setServiceCenterUuid(uuid: string)` - установить UUID сервисного центра
- `setDateRange(from: Date, to: Date)` - установить диапазон дат
- `setSelectedStatuses(statuses: BookingStatus[])` - установить фильтр статусов
- `fetchBookings()` - загрузить список бронирований
- `fetchBookingDetails(uuid: string)` - загрузить детали бронирования
- `updateBookingStatus(uuid: string, status: BookingStatus)` - обновить статус
- `updateBooking(uuid: string, data: UpdateAdminBookingDto)` - обновить данные
- `clearSelectedBooking()` - очистить выбранное бронирование

### Computed

- `bookingsByDate: Map<string, AdminBookingResponseDto[]>` - группировка по датам
- `bookingsByTimeSlot: Map<string, AdminBookingResponseDto[]>` - группировка по временным слотам
- `getBookingsForDate(date: Date)` - бронирования для даты
- `getBookingsForTimeSlot(date: Date, timeSlot: string)` - бронирования для слота
- `statusStats` - статистика по статусам
- `totalRevenue: number` - общая выручка

## Типы статусов

```typescript
type BookingStatus = 
  | 'pending_confirmation'  // Ожидает подтверждения
  | 'confirmed'             // Подтверждено
  | 'completed'             // Завершено
  | 'cancelled';            // Отменено
```

## Интеграция с Toast уведомлениями

Store автоматически показывает toast уведомления при:
- ✅ Успешном обновлении статуса
- ✅ Успешном обновлении данных
- ❌ Ошибках при загрузке или обновлении

## Storybook

Посмотреть примеры использования можно в Storybook:
- `Stores/BookingsStore/Empty Store` - пустой стор
- `Stores/BookingsStore/With Mock Data` - стор с моковыми данными

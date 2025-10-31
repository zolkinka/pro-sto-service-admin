# CreateBookingModal

Модальное окно для создания нового бронирования администратором.

## Описание

Компонент представляет собой форму для создания заказа администратором через клик на свободный слот в календаре. Форма включает все необходимые поля для полноценного создания бронирования.

## Использование

```tsx
import CreateBookingModal from './components/CreateBookingModal';

<CreateBookingModal
  isOpen={isOpen}
  onClose={handleClose}
  onSuccess={handleSuccess}
  initialDate={selectedDate}
  initialTime="10:00"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Открыта ли модалка |
| `onClose` | `() => void` | ✅ | Callback при закрытии |
| `onSuccess` | `() => void` | ✅ | Callback при успешном создании |
| `initialDate` | `Date` | ❌ | Предзаполненная дата |
| `initialTime` | `string` | ❌ | Предзаполненное время (формат "HH:mm") |

## Поля формы

1. **Номер телефона** - поиск/создание клиента
2. **Номер автомобиля** - гос номер
3. **Марка автомобиля** - селект с загрузкой из API
4. **Модель автомобиля** - селект, зависит от марки
5. **Дата** - DatePicker, только будущие даты
6. **Время** - TimePicker с шагом 15 минут
7. **Основная услуга** - селект услуг типа "main"
8. **Дополнительные услуги** - мультиселект услуг типа "additional"
9. **Комментарий** - текстовое поле

## API интеграция

Компонент использует следующие API эндпоинты:

### 1. Поиск/создание клиента
```typescript
adminFindOrCreateClient({
  requestBody: { phone: string }
})
```
- Ищет клиента по телефону
- Если не найден - создает нового
- Возвращает `{ uuid, phone, name, email, created }`

### 2. Создание/обновление автомобиля
```typescript
adminCreateOrUpdateCar({
  clientUuid: string,
  requestBody: {
    license_plate: string,
    make: string,
    model: string,
    make_id?: string,
    model_id?: string,
  }
})
```
- Ищет автомобиль по номеру
- Если найден - обновляет данные
- Если не найден - создает новый
- Возвращает `{ uuid, license_plate, make, model, ... }`

### 3. Создание бронирования
```typescript
adminCreateBooking({
  requestBody: {
    service_center_uuid: string,
    client_uuid: string,
    car_uuid: string,
    service_uuid: string,
    start_time: string, // ISO 8601 UTC
    payment_method: 'cash' | 'card' | 'sbp',
    additional_service_uuids?: string[],
    admin_comment?: string,
  }
})
```
- Создает бронирование со статусом 'confirmed'
- Проверяет доступность временного слота
- Возвращает полную информацию о бронировании

### Обработка ошибок

- **409** - Временной слот уже занят
- **404** - Не найдены клиент/автомобиль/услуга
- **400** - Некорректные данные запроса
- Другие ошибки - общее сообщение об ошибке

### Флоу создания бронирования

1. Пользователь заполняет форму
2. При отправке происходит последовательно:
   - Поиск/создание клиента по телефону
   - Создание/обновление автомобиля
   - Создание бронирования
3. При успехе вызывается `onSuccess()` для обновления списка
4. Модальное окно закрывается
5. Форма сбрасывается

## Зависимости

- `authStore` - для получения `service_center_uuid`
- `servicesStore` - для получения списка услуг
- `toastStore` - для отображения уведомлений
- `carsControllerGetMakes` - для загрузки марок
- `carsControllerGetModelsByMakeId` - для загрузки моделей
- `adminFindOrCreateClient` - для работы с клиентами
- `adminCreateOrUpdateCar` - для работы с автомобилями
- `adminCreateBooking` - для создания бронирований

## Валидация

- Телефон должен быть корректным российским номером
- Все обязательные поля должны быть заполнены
- Дата должна быть в будущем
- Время должно быть выбрано

## Стилизация

Компонент использует Onest шрифт и цветовую схему:
- Фон: `#FFFFFF`
- Границы: `#F4F3F0`
- Текст: `#53514F` / `#302F2D`
- Акцент: `#4169E3`

## Зависимости

- `mobx-react-lite` - для интеграции с stores
- `date-fns` - для работы с датами
- `@/components/ui/*` - UI компоненты приложения

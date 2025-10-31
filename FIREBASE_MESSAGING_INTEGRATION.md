# Firebase Cloud Messaging Integration

## Обзор

Интеграция Firebase Cloud Messaging (FCM) для отправки push-уведомлений пользователям админ-панели Pro-STO.

## Файловая структура

```
src/
├── services/
│   ├── firebase.ts                    # Инициализация Firebase
│   └── notificationService.ts         # Сервис управления уведомлениями
├── components/
│   └── NotificationSettings/          # UI компонент настроек
│       ├── NotificationSettings.tsx
│       ├── NotificationSettings.css
│       ├── NotificationSettings.types.ts
│       ├── NotificationSettings.stories.tsx
│       └── index.ts
public/
└── firebase-messaging-sw.js           # Service Worker для фоновых уведомлений
```

## Установка и настройка

### 1. Установка зависимостей

```bash
pnpm install firebase
```

### 2. Настройка Firebase Console

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Cloud Messaging:
   - Перейдите в Project Settings → Cloud Messaging
   - Включите Cloud Messaging API
4. Получите конфигурацию проекта:
   - Project Settings → General → Your apps
   - Скопируйте конфигурацию Web app
5. Сгенерируйте VAPID ключ:
   - Project Settings → Cloud Messaging → Web Push certificates
   - Generate key pair

### 3. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Cloud Messaging VAPID Key
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### 4. Обновление Service Worker

Отредактируйте `public/firebase-messaging-sw.js` и замените placeholder конфигурацию на реальную:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

## Использование

### Инициализация уведомлений

Сервис уведомлений автоматически инициализируется при монтировании компонента `NotificationSettings`:

```tsx
import NotificationSettings from '@/components/NotificationSettings';

function SettingsPage() {
  return (
    <div>
      <h1>Настройки</h1>
      <NotificationSettings />
    </div>
  );
}
```

### Программное управление уведомлениями

```typescript
import { notificationService } from '@/services/notificationService';

// Проверка поддержки
const isSupported = await notificationService.isSupported();

// Инициализация
const initialized = await notificationService.initialize();

// Получение токена
const token = await notificationService.getToken();

// Обновление настроек
await notificationService.updateSettings({
  enabled: true,
  types: {
    booking_created: true,
    booking_confirmed: true,
    // ...
  },
});

// Добавление обработчика сообщений
notificationService.addMessageHandler((payload) => {
  console.log('Received message:', payload);
});
```

## Типы уведомлений

Поддерживаются следующие типы уведомлений:

- `BOOKING_CREATED` - Создание бронирования
- `BOOKING_CONFIRMED` - Подтверждение бронирования
- `BOOKING_CANCELLED` - Отмена бронирования
- `BOOKING_REMINDER` - Напоминание о бронировании
- `BOOKING_COMPLETED` - Завершение бронирования

## API Endpoints (TODO)

⚠️ **ВАЖНО**: Следующие API endpoints необходимо реализовать на сервере:

### Сохранение FCM токена

```
POST /api/admin/device-tokens
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "fcm_token": "string",
  "device_info": {
    "platform": "web",
    "browser": "Chrome",
    "device_id": "string" (optional)
  }
}
```

### Удаление FCM токена

```
DELETE /api/admin/device-tokens
Authorization: Bearer <access_token>

{
  "fcm_token": "string"
}
```

### Получение настроек уведомлений

```
GET /api/admin/notification-settings
Authorization: Bearer <access_token>

Response:
{
  "enabled": boolean,
  "types": {
    "booking_created": boolean,
    "booking_confirmed": boolean,
    "booking_cancelled": boolean,
    "booking_reminder": boolean,
    "booking_completed": boolean
  }
}
```

### Обновление настроек уведомлений

```
PUT /api/admin/notification-settings
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "enabled": boolean,
  "types": {
    "booking_created": boolean,
    "booking_confirmed": boolean,
    // ...
  }
}
```

## Service Worker

Service Worker (`firebase-messaging-sw.js`) обрабатывает уведомления в фоновом режиме:

- Получение сообщений когда приложение неактивно
- Отображение нативных уведомлений браузера
- Обработка кликов по уведомлениям
- Навигация к соответствующим страницам приложения

## Передний план vs Фон

### Передний план (Foreground)
Когда приложение активно:
- Обрабатывается через `onMessage` в `notificationService`
- Отображается через Toast компонент приложения
- Может быть кастомизировано

### Фон (Background)
Когда приложение неактивно:
- Обрабатывается Service Worker
- Отображается как нативное уведомление браузера
- Клик по уведомлению открывает/фокусирует приложение

## Тестирование

### 1. Локальное тестирование через Storybook

```bash
pnpm storybook
```

Откройте `Components/NotificationSettings` в Storybook для визуального тестирования.

### 2. Тестирование с Firebase Console

1. Перейдите в Firebase Console → Cloud Messaging
2. Выберите "Send test message"
3. Введите FCM токен из debug секции компонента
4. Отправьте тестовое сообщение

### 3. Формат тестового сообщения

```json
{
  "notification": {
    "title": "Новое бронирование",
    "body": "Клиент забронировал мойку на 14:00",
    "icon": "/logo.png"
  },
  "data": {
    "type": "booking_created",
    "booking_id": "123",
    "click_action": "/orders/123"
  }
}
```

## Безопасность

### VAPID ключ
- VAPID ключ должен быть безопасно сохранен в переменных окружения
- Не коммитьте `.env` файл в репозиторий
- Используйте разные ключи для разных окружений (dev/staging/prod)

### Токены
- FCM токены должны храниться на сервере связанными с пользователем
- Токены должны удаляться при логауте
- Старые/неактивные токены должны периодически очищаться

### HTTPS
- Service Worker работает только через HTTPS (кроме localhost)
- В production убедитесь что приложение использует HTTPS

## Troubleshooting

### Уведомления не работают

1. **Проверьте переменные окружения**
   ```bash
   # Все переменные должны быть заполнены
   echo $VITE_FIREBASE_API_KEY
   echo $VITE_FIREBASE_VAPID_KEY
   ```

2. **Проверьте консоль браузера**
   - Откройте DevTools → Console
   - Ищите ошибки от Firebase

3. **Проверьте Service Worker**
   - DevTools → Application → Service Workers
   - Убедитесь что `firebase-messaging-sw.js` зарегистрирован и активен

4. **Проверьте разрешения браузера**
   - Settings → Site settings → Notifications
   - Убедитесь что уведомления разрешены для вашего сайта

### Service Worker не регистрируется

- Убедитесь что файл находится в `public/firebase-messaging-sw.js`
- Проверьте что конфигурация Firebase в Service Worker корректна
- Очистите кэш браузера и перезагрузите страницу

### Токен не получается

- Проверьте что VAPID ключ корректный
- Убедитесь что пользователь дал разрешение на уведомления
- Проверьте что Service Worker успешно зарегистрирован

## Browser Support

- Chrome 50+
- Firefox 44+
- Safari 16+
- Edge 79+

⚠️ **Note**: Service Workers не работают в Private/Incognito режиме некоторых браузеров

## Дальнейшее развитие

- [ ] Реализация API endpoints на сервере
- [ ] Добавление rich notifications (изображения, действия)
- [ ] Группировка уведомлений
- [ ] Настройки звука и вибрации
- [ ] Статистика доставки уведомлений
- [ ] A/B тестирование уведомлений
- [ ] Персонализация контента уведомлений

## Ссылки

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)

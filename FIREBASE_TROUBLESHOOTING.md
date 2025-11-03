# Диагностика проблемы "Уведомления не поддерживаются"

## Возможные причины

### 1. Firebase не сконфигурирован
**Проверка:** Функция `isFirebaseConfigured()` возвращает `false`

**Что проверить:**
- Все переменные окружения Firebase заполнены в `.env`
- Переменные начинаются с `VITE_` (иначе Vite их не увидит)
- После изменения `.env` файла сервер разработки был перезапущен

**Проверенные переменные в .env:**
```
✅ VITE_FIREBASE_API_KEY=AIzaSyAJNYZVxdjvvbVtCx-QcPzHPUzRfgESWvo
✅ VITE_FIREBASE_AUTH_DOMAIN=prosto-b13d3.firebaseapp.com
✅ VITE_FIREBASE_PROJECT_ID=prosto-b13d3
✅ VITE_FIREBASE_STORAGE_BUCKET=prosto-b13d3.firebasestorage.app
✅ VITE_FIREBASE_MESSAGING_SENDER_ID=976005377903
✅ VITE_FIREBASE_APP_ID=1:976005377903:web:51020e03cc75058ab9c29a
✅ VITE_FIREBASE_VAPID_KEY=BMp94qdJ7gsYOiFyHnAm-EFOLUBbQZ-mBpW3VEgav3Hhf1hHNHN5Ow14Py5Yw5AKUrGRXhZ3AWYlndCOuBVs5wA
```

### 2. Firebase Messaging не поддерживается браузером
**Проверка:** Функция `isMessagingSupported()` возвращает `false`

**Что проверить:**
- Браузер поддерживает Service Workers
- Приложение запущено по HTTPS (или на localhost)
- Используется современная версия браузера (Chrome 50+, Firefox 44+, Safari 16+)

### 3. Notification API не поддерживается
**Проверка:** `'Notification' in window` возвращает `false`

**Что проверить:**
- Используется очень старый браузер
- Браузер в режиме инкогнито (в некоторых браузерах отключены уведомления)

### 4. Service Worker не может быть зарегистрирован
**Проверка:** Файл `/firebase-messaging-sw.js` недоступен или содержит ошибки

**Что проверить:**
- Файл `public/firebase-messaging-sw.js` существует
- Файл доступен по URL: `http://localhost:5173/firebase-messaging-sw.js`
- В файле нет синтаксических ошибок

## Пошаговая диагностика

### Шаг 1: Откройте консоль браузера (F12)

Перейдите в раздел Console и посмотрите на сообщения. Должны быть:
- ✅ `Firebase initialized successfully`
- ✅ `Firebase Messaging initialized successfully`

Или ошибки:
- ❌ `Firebase is not configured properly`
- ❌ `Firebase Messaging is not supported in this browser`
- ❌ `Notification API is not supported`
- ❌ `Service Worker is not supported in this browser`

### Шаг 2: Проверьте переменные окружения

Откройте консоль и выполните:
```javascript
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('VAPID Key:', import.meta.env.VITE_FIREBASE_VAPID_KEY);
```

Если видите `undefined` - переменные не загружены. **Решение:** Перезапустите dev-сервер.

### Шаг 3: Проверьте Service Worker

В DevTools перейдите в `Application` -> `Service Workers`:
- Должен быть зарегистрирован `firebase-messaging-sw.js`
- Статус должен быть "activated and running"

Если Service Worker не зарегистрирован или показывает ошибку:
1. Проверьте, что файл `public/firebase-messaging-sw.js` существует
2. Откройте `http://localhost:5173/firebase-messaging-sw.js` напрямую - должен открыться файл
3. Проверьте консоль на ошибки регистрации SW

### Шаг 4: Проверьте поддержку браузером

В консоли выполните:
```javascript
console.log('Notification API:', 'Notification' in window);
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('PushManager:', 'PushManager' in window);
```

Все должны вернуть `true`.

## Быстрое решение

### 1. Перезапустите dev-сервер
```bash
# Остановите текущий сервер (Ctrl+C)
pnpm dev
```

### 2. Очистите кэш браузера
- Chrome: DevTools -> Application -> Clear storage -> Clear site data
- Firefox: DevTools -> Storage -> Clear all storage

### 3. Проверьте HTTPS
Если приложение открыто не по `localhost` и не по `https://`:
- Firebase Messaging работает только на localhost или HTTPS
- Настройте HTTPS для локальной разработки или используйте localhost

### 4. Проверьте блокировку уведомлений
В настройках браузера:
- Chrome: `chrome://settings/content/notifications`
- Firefox: `about:preferences#privacy` -> Permissions -> Notifications
- Safari: Safari -> Settings -> Websites -> Notifications

Убедитесь, что сайт не заблокирован.

## Если ничего не помогло

Добавьте в компонент `NotificationSettings.tsx` перед проверкой `isSupported`:

```typescript
useEffect(() => {
  const checkSupport = async () => {
    console.log('=== FIREBASE DIAGNOSTICS ===');
    console.log('1. Config check:', import.meta.env.VITE_FIREBASE_API_KEY ? 'OK' : 'FAIL');
    console.log('2. Notification API:', 'Notification' in window);
    console.log('3. Service Worker:', 'serviceWorker' in navigator);
    console.log('4. isFirebaseConfigured:', isFirebaseConfigured());
    
    try {
      const { isMessagingSupported } = await import('firebase/messaging');
      const supported = await isMessagingSupported();
      console.log('5. Firebase Messaging supported:', supported);
    } catch (e) {
      console.error('5. Firebase Messaging error:', e);
    }
    
    const finalSupported = await notificationService.isSupported();
    console.log('6. Final isSupported:', finalSupported);
    console.log('=== END DIAGNOSTICS ===');
    
    setIsSupported(finalSupported);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  checkSupport();
}, []);
```

Это покажет детальную информацию о том, на каком этапе возникает проблема.

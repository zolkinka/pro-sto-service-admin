// Service Worker для обработки фоновых уведомлений Firebase Cloud Messaging
// Этот файл должен находиться в public/ директории

// Импортируем скрипты Firebase
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Конфигурация Firebase
// Эти значения должны совпадать с конфигурацией в основном приложении
const firebaseConfig = {
  apiKey: 'AIzaSyAJNYZVxdjvvbVtCx-QcPzHPUzRfgESWvo',
  authDomain: 'prosto-b13d3.firebaseapp.com',
  projectId: 'prosto-b13d3',
  storageBucket: 'prosto-b13d3.firebasestorage.app',
  messagingSenderId: '976005377903',
  appId: '1:976005377903:web:51020e03cc75058ab9c29a',
};

// Инициализация Firebase в Service Worker
firebase.initializeApp(firebaseConfig);

// Получение экземпляра messaging
const messaging = firebase.messaging();

// Обработка фоновых сообщений
// Срабатывает когда приложение неактивно или закрыто
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Pro-STO';
  const notificationOptions = {
    body: payload.notification?.body || 'Новое уведомление',
    icon: payload.notification?.icon || '/logo.png',
    badge: '/badge.png',
    tag: payload.data?.type || 'general',
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  // Показываем уведомление
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Определяем URL для перехода в зависимости от типа уведомления
  const data = event.notification.data || {};
  let urlToOpen = '/';

  if (data.type === 'booking_created' || data.type === 'booking_confirmed') {
    urlToOpen = `/orders/${data.booking_id || ''}`;
  } else if (data.type === 'booking_reminder') {
    urlToOpen = `/orders/${data.booking_id || ''}`;
  }

  // Открываем/фокусируем окно приложения
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Проверяем, есть ли уже открытое окно
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }

        // Если нет, открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Обработка закрытия уведомления
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);
});

console.log('[firebase-messaging-sw.js] Service Worker loaded');

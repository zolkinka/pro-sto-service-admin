import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

/**
 * Firebase Configuration
 * Используются переменные окружения из .env файла
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * VAPID key для Web Push
 * Необходим для получения FCM токенов
 */
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Инициализация Firebase app
 * Вызывается автоматически при импорте модуля
 */
export const initializeFirebase = (): FirebaseApp => {
  if (app) {
    return app;
  }

  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    return app;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

/**
 * Получить экземпляр Firebase Messaging
 * Инициализируется только в браузерной среде, которая поддерживает Service Worker
 */
export const getFirebaseMessaging = (): Messaging | null => {
  if (messaging) {
    return messaging;
  }

  // Проверяем поддержку Service Worker
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported in this browser');
    return null;
  }

  try {
    if (!app) {
      initializeFirebase();
    }
    
    messaging = getMessaging(app!);
    console.log('Firebase Messaging initialized successfully');
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
};

/**
 * Проверка наличия всех необходимых переменных окружения
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    VAPID_KEY
  );
};

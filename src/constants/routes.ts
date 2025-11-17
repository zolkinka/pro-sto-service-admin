export const ROUTES = {
  DASHBOARD: '/',
  NOT_FOUND: '/404',
  AUTH_PHONE: '/auth/phone',
  AUTH_CODE: '/auth/code',
  SERVICES: '/services',
  ORDERS: '/orders',
  ANALYTICS: '/analytics',
  SCHEDULE: '/schedule',
  SCHEDULE_EDIT: '/schedule/edit',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  PAYMENT_MOCK: '/payment-mock/:bookingUuid',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];
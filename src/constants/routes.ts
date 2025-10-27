export const ROUTES = {
  DASHBOARD: '/',
  NOT_FOUND: '/404',
  AUTH_PHONE: '/auth/phone',
  AUTH_CODE: '/auth/code',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];
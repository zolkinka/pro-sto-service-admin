export const ROUTES = {
  DASHBOARD: '/',
  BUTTON_SHOWCASE: '/buttons',
  NOT_FOUND: '/404',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];
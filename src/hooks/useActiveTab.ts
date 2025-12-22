import { useLocation } from 'react-router-dom';

/**
 * Тип для возможных табов навигации
 */
export type Tab = 'services' | 'orders' | 'analytics' | 'schedule';

/**
 * Хук для определения активного таба на основе текущего URL
 * @returns Активный таб или undefined если путь не соответствует ни одному табу
 */
export const useActiveTab = (): Tab | undefined => {
  const location = useLocation();

  if (location.pathname.includes('/services')) return 'services';
  if (location.pathname.includes('/orders')) return 'orders';
  if (location.pathname.includes('/analytics')) return 'analytics';
  if (location.pathname.includes('/schedule')) return 'schedule';

  return undefined; // Для других страниц (например, /settings) не выделяем ни один таб
};

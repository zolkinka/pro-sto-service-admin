import { useLocation } from 'react-router-dom';

/**
 * Тип для возможных табов навигации
 */
export type Tab = 'services' | 'orders' | 'analytics' | 'schedule';

/**
 * Хук для определения активного таба на основе текущего URL
 * @returns Активный таб или 'services' по умолчанию
 */
export const useActiveTab = (): Tab => {
  const location = useLocation();

  if (location.pathname.includes('/services')) return 'services';
  if (location.pathname.includes('/orders')) return 'orders';
  if (location.pathname.includes('/analytics')) return 'analytics';
  if (location.pathname.includes('/schedule')) return 'schedule';

  return 'services'; // Default
};

import type { ReactNode } from 'react';

export interface StatCardProps {
  /** Заголовок карточки */
  title: string;
  /** Числовое значение */
  value: string | number;
  /** Процент изменения (может быть положительным или отрицательным) */
  change?: number;
  /** Иконка для отображения в правом верхнем углу */
  icon: ReactNode;
  /** Дополнительный CSS класс */
  className?: string;
  /** Состояние загрузки */
  loading?: boolean;
}

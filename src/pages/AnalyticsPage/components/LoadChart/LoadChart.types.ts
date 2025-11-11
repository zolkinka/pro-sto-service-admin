export interface ChartDataPoint {
  /** Метка оси X (день недели или час) */
  label: string;
  /** Значение для столбца */
  value: number;
}

export interface LoadChartProps {
  /** Массив данных для отображения */
  data: ChartDataPoint[];
  /** Максимальное значение для шкалы Y (по умолчанию вычисляется автоматически) */
  maxCount?: number;
  /** Состояние загрузки */
  loading?: boolean;
  /** Дополнительный CSS класс */
  className?: string;
  /** Текущий период ("month" | "week") чтобы корректно рендерить количество меток X */
  period?: 'month' | 'week';
  /** Текущая дата (используется для вычисления количества дней в месяце при period='month') */
  date?: Date;
}

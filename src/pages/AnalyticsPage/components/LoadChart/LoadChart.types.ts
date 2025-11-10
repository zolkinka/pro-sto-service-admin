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
}

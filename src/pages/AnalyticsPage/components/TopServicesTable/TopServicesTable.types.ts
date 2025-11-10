export interface ServiceData {
  /** ID услуги */
  id: string;
  /** Название услуги */
  name: string;
  /** Количество записей */
  bookingsCount: number;
  /** Выручка в рублях */
  revenue: number;
}

export interface TopServicesTableProps {
  /** Массив услуг для отображения */
  services: ServiceData[];
  /** Состояние загрузки */
  loading?: boolean;
  /** Дополнительный CSS класс */
  className?: string;
}

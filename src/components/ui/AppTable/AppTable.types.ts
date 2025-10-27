import React from 'react';

// Типы для выравнивания, данных и вариантов отображения
export type AppTableAlign = 'left' | 'center' | 'right';
export type AppTableDataType = 'text' | 'number' | 'date' | 'datetime' | 'boolean';
export type AppTableCellVariant = 'primary' | 'secondary';

// Интерфейс колонки таблицы
export interface AppTableColumn<RowType = Record<string, unknown>> {
  /** Заголовок колонки */
  label?: string;
  /** Путь до значения (user.name, doctor.clinic.name) */
  field?: string;
  /** Тип данных для автоформатирования */
  type?: AppTableDataType;
  /** Вариант текста (primary - черный, secondary - серый) */
  variant?: AppTableCellVariant;
  /** Функция получения сырого значения */
  value?: (row: RowType, index: number) => unknown;
  /** Кастомный рендер ячейки */
  render?: (row: RowType, index: number) => React.ReactNode;
  /** Кастомный рендер заголовка */
  renderHeader?: () => React.ReactNode;
  /** Явная ширина */
  width?: number | string;
  /** Выравнивание содержимого */
  align?: AppTableAlign;
  /** Доп. класс для TD */
  className?: string;
  /** Доп. класс для TH */
  headerClassName?: string;
}

// Основные пропсы компонента таблицы
export interface AppTableProps<RowType = Record<string, unknown>> {
  columns: AppTableColumn<RowType>[];
  rows: RowType[];
  className?: string;
  style?: React.CSSProperties;
  /** Placeholder, когда нет данных */
  emptyPlaceholder?: React.ReactNode;
  /** Клик по строке */
  onRowClick?: (row: RowType, index: number) => void;
  /** Ключ строки */
  getRowKey?: (row: RowType, index: number) => React.Key;
}

// Типы для Styled Components
export interface TableRowProps {
  $clickable?: boolean;
}

export interface TableHeaderCellProps {
  $align?: AppTableAlign;
}

export interface TableCellProps {
  $align?: AppTableAlign;
  $variant?: AppTableCellVariant;
}

import React from 'react';
import {
  TableWrapper,
  StyledTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyRow,
} from './AppTable.styles';
import type { AppTableProps, AppTableColumn } from './AppTable.types';

// --- Helper функции ---

/**
 * Получить значение по вложенному пути (например, "user.name")
 */
const getByPath = (obj: unknown, path?: string): unknown => {
  if (!obj || !path || typeof obj !== 'object') return undefined;
  
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
};

/**
 * Форматирование значения в зависимости от типа
 */
const formatValue = (val: unknown, type: AppTableColumn['type']): React.ReactNode => {
  if (val == null) return '';
  
  switch (type) {
    case 'number':
      return typeof val === 'number' ? val : Number(val) || '';
    case 'date': {
      const d = new Date(val as string | number | Date);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
    }
    case 'datetime': {
      const d = new Date(val as string | number | Date);
      return isNaN(d.getTime()) ? '' : d.toLocaleString();
    }
    case 'boolean':
      return val ? '✓' : '—';
    default:
      return String(val);
  }
};

/**
 * Компонент таблицы AppTable
 */
export const AppTable = <RowType extends Record<string, unknown>>(
  props: AppTableProps<RowType>
) => {
  const {
    columns,
    rows,
    className = '',
    style,
    emptyPlaceholder = 'Нет данных',
    onRowClick,
    getRowKey,
  } = props;

  return (
    <TableWrapper style={style} className={className}>
      <StyledTable role="table">
        {/* Заголовок таблицы */}
        <TableHeader>
          <tr>
            {columns.map((col, ci) => {
              const widthStyle: React.CSSProperties =
                col.width != null
                  ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
                  : {};

              return (
                <TableHeaderCell
                  key={ci}
                  $align={col.align}
                  className={col.headerClassName}
                  style={widthStyle}
                  scope="col"
                  role="columnheader"
                >
                  {col.renderHeader ? col.renderHeader() : col.label}
                </TableHeaderCell>
              );
            })}
          </tr>
        </TableHeader>

        {/* Тело таблицы */}
        <TableBody>
          {/* Показываем placeholder если нет данных */}
          {rows.length === 0 && (
            <EmptyRow>
              <td colSpan={columns.length}>{emptyPlaceholder}</td>
            </EmptyRow>
          )}

          {/* Отрисовка строк данных */}
          {rows.map((row, ri) => {
            const key = getRowKey ? getRowKey(row, ri) : (ri as React.Key);
            const handleClick = onRowClick ? () => onRowClick(row, ri) : undefined;

            return (
              <TableRow
                key={key}
                $clickable={!!onRowClick}
                role="row"
                onClick={handleClick}
              >
                {columns.map((col, ci) => {
                  let content: React.ReactNode;

                  // Определяем контент ячейки по приоритету
                  if (col.render) {
                    // Кастомный рендер имеет наивысший приоритет
                    content = col.render(row, ri);
                  } else if (col.value) {
                    // Функция получения значения
                    content = formatValue(col.value(row, ri), col.type || 'text');
                  } else if (col.field) {
                    // Путь до поля
                    content = formatValue(getByPath(row, col.field), col.type || 'text');
                  } else {
                    content = '';
                  }

                  return (
                    <TableCell
                      key={ci}
                      $align={col.align}
                      $variant={col.variant}
                      className={col.className}
                      role="cell"
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </StyledTable>
    </TableWrapper>
  );
};

export default AppTable;

import React from 'react';
import classNames from 'classnames';
import type { AppTableProps, AppTableColumn } from './AppTable.types';
import './AppTable.css';

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
    <div style={style} className={classNames('app-table', className)}>
      <table className="app-table__table" role="table">
        {/* Заголовок таблицы */}
        <thead className="app-table__head">
          <tr>
            {columns.map((col, ci) => {
              const widthStyle: React.CSSProperties =
                col.width != null
                  ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
                  : {};

              const headerClassName = classNames(
                'app-table__header-cell',
                {
                  [`app-table__header-cell_align_${col.align}`]: col.align,
                },
                col.headerClassName
              );

              return (
                <th
                  key={ci}
                  className={headerClassName}
                  style={widthStyle}
                  scope="col"
                  role="columnheader"
                >
                  {col.renderHeader ? col.renderHeader() : col.label}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Тело таблицы */}
        <tbody className="app-table__body">
          {/* Показываем placeholder если нет данных */}
          {rows.length === 0 && (
            <tr className="app-table__row app-table__row_empty">
              <td className="app-table__cell" colSpan={columns.length}>{emptyPlaceholder}</td>
            </tr>
          )}

          {/* Отрисовка строк данных */}
          {rows.map((row, ri) => {
            const key = getRowKey ? getRowKey(row, ri) : (ri as React.Key);
            const handleClick = onRowClick ? () => onRowClick(row, ri) : undefined;

            const rowClassName = classNames('app-table__row', {
              'app-table__row_clickable': !!onRowClick,
            });

            return (
              <tr
                key={key}
                className={rowClassName}
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

                  const cellClassName = classNames(
                    'app-table__cell',
                    {
                      [`app-table__cell_align_${col.align}`]: col.align,
                      [`app-table__cell_variant_${col.variant}`]: col.variant,
                    },
                    col.className
                  );

                  return (
                    <td
                      key={ci}
                      className={cellClassName}
                      role="cell"
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppTable;

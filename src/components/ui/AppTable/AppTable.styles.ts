import styled from 'styled-components';
import type { TableRowProps, TableHeaderCellProps, TableCellProps } from './AppTable.types';

// Wrapper для всего компонента таблицы
export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

// Основная таблица
export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-family: ${({ theme }) => theme.fonts.onest};
  background: white;
`;

// Заголовок таблицы (thead) - без фона
export const TableHeader = styled.thead`
  /* Без фона - только белый */
`;

// Ячейка заголовка таблицы
export const TableHeaderCell = styled.th<TableHeaderCellProps>`
  height: 43px;
  min-height: 43px;
  padding: 12px 12px 12px 0;
  text-align: ${({ $align }) => $align || 'left'};
  vertical-align: middle;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.gray[600]};
  
  /* Первая ячейка без левого padding */
  &:first-child {
    padding-left: 0;
  }
`;

// Тело таблицы
export const TableBody = styled.tbody``;

// Строка таблицы
export const TableRow = styled.tr<TableRowProps>`
  ${({ $clickable }) =>
    $clickable &&
    `
    cursor: pointer;
    transition: background 0.15s ease;
    
    &:hover {
      background: rgba(249, 248, 245, 0.5);
    }
  `}
`;

// Ячейка данных таблицы
export const TableCell = styled.td<TableCellProps>`
  height: 49px;
  min-height: 43px;
  padding: 16px 12px 16px 0;
  text-align: ${({ $align }) => $align || 'left'};
  vertical-align: middle;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme, $variant }) =>
    $variant === 'secondary' ? theme.colors.gray[700] : theme.colors.gray[900]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  
  /* Первая ячейка без левого padding */
  &:first-child {
    padding-left: 0;
  }
`;

// Строка для пустой таблицы
export const EmptyRow = styled(TableRow)`
  td {
    text-align: center;
    font-style: italic;
    opacity: 0.7;
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

// Контейнер для кнопок действий (edit, delete)
export const ActionButtons = styled.div`
  display: flex;
  gap: 9px;
  align-items: center;
`;

// Кнопка действия (edit, delete)
export const ActionButton = styled.button`
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.gray[900]};
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

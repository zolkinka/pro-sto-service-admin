import styled from 'styled-components';

export const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TableHeader = styled.div`
  display: flex;
  height: 43px;
  min-height: 43px;
`;

export const TableRow = styled.div`
  display: flex;
  min-height: 49px;
`;

export const TableCell = styled.div<{ width: number; $isHeader?: boolean }>`
  width: ${(props) => props.width}px;
  padding: ${(props) => (props.$isHeader ? '12px 12px 12px 0' : '16px 12px 16px 0')};
  display: flex;
  align-items: center;
  border-bottom: ${(props) => (props.$isHeader ? 'none' : '1px solid #f9f8f5')};

  font-family: 'Onest', sans-serif;
  font-weight: 400;
  font-size: ${(props) => (props.$isHeader ? '12px' : '14px')};
  line-height: 1.2;
  color: ${(props) => (props.$isHeader ? '#888684' : '#302f2d')};
`;

export const TableCellSecondary = styled(TableCell)`
  color: #73716f;
`;

export const ActionsCell = styled(TableCell)`
  display: flex;
  gap: 9px;
  padding-right: 0;
`;

export const IconButton = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    stroke: #888684;
  }

  &:hover svg {
    stroke: #302f2d;
  }
`;

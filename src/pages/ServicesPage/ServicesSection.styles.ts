import styled from 'styled-components';

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SectionTitle = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

export const Title = styled.p`
  font-family: 'Onest', sans-serif;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.2;
  color: #302f2d;
  margin: 0;
`;

export const CategoryTabs = styled.div`
  background: #f9f8f5;
  border-radius: 16px;
  padding: 8px;
  display: flex;
  gap: 8px;
`;

export const CategoryTab = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? 'white' : 'transparent')};
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-family: 'Onest', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.2;
  color: ${(props) => (props.$active ? '#302f2d' : '#53514f')};
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$active ? '0px 1px 2px 0px rgba(30, 27, 21, 0.05)' : 'none'};
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export const AddServiceButton = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  height: 40px;
`;

export const AddServiceText = styled.p`
  font-family: 'Onest', sans-serif;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.2;
  color: #302f2d;
  margin: 0;
`;

export const AddButton = styled.button`
  width: 40px;
  height: 40px;
  background: #302f2d;
  border: none;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: white;
  }
`;

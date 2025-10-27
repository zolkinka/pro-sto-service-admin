import styled from 'styled-components';

export const SelectWrapper = styled.div<{ $disabled?: boolean }>`
  position: relative;
  width: 100%;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`;

export const InputContainer = styled.div<{ $errored?: boolean; $isOpen?: boolean }>`
  position: relative;
  cursor: pointer;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 40px;
  bottom: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: 20px;
  line-height: 1;
  transition: color 0.2s;
  z-index: 1;

  &:hover {
    color: ${({ theme }) => theme.colors.gray[700]};
  }
`;

export const ArrowIconWrapper = styled.div<{ $isOpen?: boolean }>`
  position: absolute;
  right: 12px;
  bottom: 18px;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DropdownContent = styled.div`
  width: 100%;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
`;

export const OptionsContainer = styled.div`
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[300]};
    border-radius: 3px;
  }
`;

export const SearchInput = styled.input`
  position: sticky;
  top: 0;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px 12px 0 0;
  outline: none;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.gray[900]};
  background: white;
  z-index: 1;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[500]};
  }
`;

export const Option = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.gray[900]};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.gray[50] : 'transparent'};
  cursor: pointer;
  transition: background 0.15s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[50]};
  }
`;

export const OptionCheck = styled.div`
  color: ${({ theme }) => theme.colors.blue[500]};
  font-size: 16px;
  font-weight: 600;
`;

export const NoOptions = styled.div`
  padding: 20px 12px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[500]};
`;

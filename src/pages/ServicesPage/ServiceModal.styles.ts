import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 24px;
  width: 412px;
  max-height: 90vh;
  box-shadow: 0px 2px 4px rgba(30, 27, 21, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 48px 48px 0 48px;
  flex-shrink: 0;
`;

export const ModalTitle = styled.h2`
  font-family: 'Onest', sans-serif;
  font-weight: 500;
  font-size: 24px;
  line-height: 1.2;
  color: #302f2d;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888684;
  
  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding: 24px 48px;
  overflow-y: auto;
  flex: 1;
  
  /* Стилизация скроллбара для webkit браузеров */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #c0c0c0;
  }
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export const SectionTitle = styled.h3`
  font-family: 'Onest', sans-serif;
  font-weight: 500;
  font-size: 18px;
  line-height: 1.2;
  color: #302f2d;
  margin: 0;
`;

export const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

export const PricesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

export const PriceRow = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
`;

export const PriceInputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 0 48px 48px 48px;
  flex-shrink: 0;
`;

export const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 16px 20px;
  border-radius: 20px;
  border: none;
  font-family: 'Onest', sans-serif;
  font-weight: ${(props) => (props.$variant === 'primary' ? '400' : '400')};
  font-size: 15px;
  line-height: 1.2;
  cursor: pointer;
  transition: opacity 0.2s;
  height: 50px;

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: #302f2d;
    color: white;
  `
      : `
    background: transparent;
    color: #302f2d;
  `}

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 52px;
  padding: 12px;
  background: #f9f8f5;
  border: 1px solid #f4f3f0;
  border-radius: 16px;
  font-family: 'Onest', sans-serif;
  font-size: 15px;
  line-height: 1.2;
  color: #302f2d;
  resize: vertical;
  
  &::placeholder {
    color: #b2b1ae;
  }

  &:focus {
    outline: none;
    border-color: #302f2d;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TextAreaLabel = styled.label`
  font-family: 'Onest', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.2;
  color: #53514f;
  display: block;
  margin-bottom: 8px;
`;

export const TextAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

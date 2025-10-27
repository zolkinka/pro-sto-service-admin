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
  padding: 32px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
`;

export const ModalTitle = styled.h2`
  font-family: 'Onest', sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 1.2;
  color: #302f2d;
  margin-bottom: 12px;
`;

export const ModalMessage = styled.p`
  font-family: 'Onest', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.5;
  color: #53514f;
  margin-bottom: 24px;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

export const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-family: 'Onest', sans-serif;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.2;
  cursor: pointer;
  transition: opacity 0.2s;

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: #302f2d;
    color: white;
  `
      : `
    background: #f9f8f5;
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

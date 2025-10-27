import React from 'react';
import {
  ModalOverlay,
  ModalContainer,
  ModalTitle,
  ModalMessage,
  ModalActions,
  ModalButton,
} from './ConfirmDeleteModal.styles';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  serviceName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  serviceName,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalTitle>Удалить услугу?</ModalTitle>
        <ModalMessage>
          Вы действительно хотите удалить услугу "{serviceName}"? Это действие
          нельзя будет отменить.
        </ModalMessage>
        <ModalActions>
          <ModalButton onClick={onCancel} disabled={isDeleting}>
            Отмена
          </ModalButton>
          <ModalButton
            $variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </ModalButton>
        </ModalActions>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ConfirmDeleteModal;

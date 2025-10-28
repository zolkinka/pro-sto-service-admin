import React from 'react';
import './ConfirmDeleteModal.css';

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
    <div className="confirm-delete-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-delete-modal">
        <h2 className="confirm-delete-modal__title">Удалить услугу?</h2>
        <p className="confirm-delete-modal__message">
          Вы действительно хотите удалить услугу "{serviceName}"? Это действие
          нельзя будет отменить.
        </p>
        <div className="confirm-delete-modal__actions">
          <button 
            className="confirm-delete-modal__button confirm-delete-modal__button_secondary"
            onClick={onCancel} 
            disabled={isDeleting}
          >
            Отмена
          </button>
          <button
            className="confirm-delete-modal__button confirm-delete-modal__button_primary"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

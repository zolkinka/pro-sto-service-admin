import React, { useEffect } from 'react';
import MobileButton from '../MobileButton/MobileButton';
import './MobileConfirmDeleteModal.css';

export interface MobileConfirmDeleteModalProps {
  isOpen: boolean;
  serviceName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const MobileConfirmDeleteModal: React.FC<MobileConfirmDeleteModalProps> = ({
  isOpen,
  serviceName,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  // Блокируем скролл при открытии модала
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mobile-confirm-delete-modal">
      <div
        className="mobile-confirm-delete-modal__overlay"
        onClick={onCancel}
        role="presentation"
      />
      <div className="mobile-confirm-delete-modal__content">
        <h3 className="mobile-confirm-delete-modal__title">Удалить услугу?</h3>
        <p className="mobile-confirm-delete-modal__text">
          Вы действительно хотите удалить услугу <strong>{serviceName}</strong>?
        </p>
        <div className="mobile-confirm-delete-modal__buttons">
          <MobileButton
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
            fullWidth
          >
            Отмена
          </MobileButton>
          <MobileButton
            variant="primary"
            onClick={onConfirm}
            loading={isDeleting}
            disabled={isDeleting}
            fullWidth
          >
            Удалить
          </MobileButton>
        </div>
      </div>
    </div>
  );
};

export default MobileConfirmDeleteModal;

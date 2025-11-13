import React, { useEffect } from 'react';
import MobileButton from '../MobileButton/MobileButton';
import './MobileConfirmDeleteModal.css';

export interface MobileConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  serviceName?: string; // Deprecated, use itemName instead
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const MobileConfirmDeleteModal: React.FC<MobileConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Удалить услугу?',
  message,
  itemName,
  serviceName, // Deprecated
  onConfirm,
  onCancel,
  isDeleting = false,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
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

  // Для обратной совместимости
  const displayName = itemName || serviceName;
  
  // Генерация сообщения по умолчанию
  const displayMessage = message || (
    displayName 
      ? <>Вы действительно хотите удалить услугу <strong>{displayName}</strong>?</>
      : 'Вы действительно хотите удалить этот элемент?'
  );

  return (
    <div className="mobile-confirm-delete-modal">
      <div
        className="mobile-confirm-delete-modal__overlay"
        onClick={onCancel}
        role="presentation"
      />
      <div className="mobile-confirm-delete-modal__content">
        <h3 className="mobile-confirm-delete-modal__title">{title}</h3>
        <p className="mobile-confirm-delete-modal__text">
          {displayMessage}
        </p>
        <div className="mobile-confirm-delete-modal__buttons">
          <MobileButton
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
            fullWidth
          >
            {cancelText}
          </MobileButton>
          <MobileButton
            variant="primary"
            onClick={onConfirm}
            loading={isDeleting}
            disabled={isDeleting}
            fullWidth
          >
            {confirmText}
          </MobileButton>
        </div>
      </div>
    </div>
  );
};

export default MobileConfirmDeleteModal;

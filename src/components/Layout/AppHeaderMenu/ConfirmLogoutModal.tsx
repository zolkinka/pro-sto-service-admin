import React from 'react';
import './ConfirmLogoutModal.css';

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
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
    <div className="confirm-logout-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-logout-modal">
        <h2 className="confirm-logout-modal__title">Выйти из системы?</h2>
        <p className="confirm-logout-modal__message">
          Вы действительно хотите выйти из системы? Вам потребуется снова войти для доступа к панели управления.
        </p>
        <div className="confirm-logout-modal__actions">
          <button 
            className="confirm-logout-modal__button confirm-logout-modal__button_secondary"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="confirm-logout-modal__button confirm-logout-modal__button_primary"
            onClick={onConfirm}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;

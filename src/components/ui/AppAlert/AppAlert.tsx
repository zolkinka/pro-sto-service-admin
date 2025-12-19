import React from 'react';
import './AppAlert.css';

interface AppAlertProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const AppAlert: React.FC<AppAlertProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Заменить',
  cancelText = 'Оставить',
}) => {
  return (
    <div className="app-alert">
      <div className="app-alert__icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="app-alert__content">
        <p className="app-alert__message">{message}</p>
        <div className="app-alert__actions">
          <button
            type="button"
            className="app-alert__button app-alert__button--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="app-alert__button app-alert__button--confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

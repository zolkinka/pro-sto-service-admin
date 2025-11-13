import React from 'react';
import './MobileDrawerContent.css';

export interface MobileDrawerContentProps {
  children: React.ReactNode;
  /** Show footer with action buttons */
  showFooter?: boolean;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel callback */
  onCancel?: () => void;
  /** Confirm callback */
  onConfirm?: () => void;
}

export const MobileDrawerContent: React.FC<MobileDrawerContentProps> = ({
  children,
  showFooter = false,
  cancelText = 'Отмена',
  confirmText = 'Добавить',
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="mobile-drawer-content">
      <div className="mobile-drawer-content__body">
        {children}
      </div>

      {showFooter && (
        <div className="mobile-drawer-content__footer">
          <button 
            className="mobile-drawer-content__button mobile-drawer-content__button--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className="mobile-drawer-content__button mobile-drawer-content__button--confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      )}
    </div>
  );
};

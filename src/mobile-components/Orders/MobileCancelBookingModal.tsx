import React from 'react';
import { MobileButton } from '@/mobile-components';
import './MobileCancelBookingModal.css';

interface MobileCancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const MobileCancelBookingModal: React.FC<MobileCancelBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mobile-cancel-booking-modal__overlay" onClick={onClose}>
      <div 
        className="mobile-cancel-booking-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-cancel-booking-modal__content">
          <h3 className="mobile-cancel-booking-modal__title">
            Вы уверены, что хотите отменить запись?
          </h3>
        </div>

        <div className="mobile-cancel-booking-modal__actions">
          <MobileButton 
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? 'Отменяем...' : 'Да, отменить'}
          </MobileButton>
          
          <MobileButton 
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            fullWidth
          >
            Нет
          </MobileButton>
        </div>
      </div>
    </div>
  );
};

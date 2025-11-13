import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './MobileDrawer.css';

export interface MobileDrawerProps {
  opened: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  maxHeight?: string; // e.g. "50vh", "400px", default "90vh"
  fixedHeight?: boolean; // if true, use maxHeight as fixed height (height = minHeight = maxHeight)
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  opened, 
  onClose, 
  children,
  maxHeight = '90vh',
  fixedHeight = false,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!opened) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [opened, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on overlay, not on drawer content
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!opened) return null;

  // Render drawer in a portal to escape parent stacking context
  return createPortal(
    <div className="mobile-drawer-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div 
        className="mobile-drawer" 
        ref={drawerRef}
        style={fixedHeight ? { 
          height: maxHeight,
          minHeight: maxHeight,
          maxHeight 
        } : { 
          maxHeight 
        }}
      >
        <div className="mobile-drawer__handle" />
        <div className="mobile-drawer__content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

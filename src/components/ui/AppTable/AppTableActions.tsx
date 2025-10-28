import React from 'react';

interface ActionButtonsProps {
  children: React.ReactNode;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ children }) => {
  return <div className="app-table__actions">{children}</div>;
};

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  children, 
  onClick,
  type = 'button' 
}) => {
  return (
    <button 
      className="app-table__action-button" 
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

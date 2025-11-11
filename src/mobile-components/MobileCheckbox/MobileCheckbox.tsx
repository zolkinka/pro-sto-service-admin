import React from 'react';
import classNames from 'classnames';
import './MobileCheckbox.css';

export interface MobileCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  'data-testid'?: string;
}

const MobileCheckbox: React.FC<MobileCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  'data-testid': dataTestId,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const checkboxClasses = classNames('mobile-checkbox', {
    'mobile-checkbox_disabled': disabled,
  });

  return (
    <label className={checkboxClasses} data-testid={dataTestId}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="mobile-checkbox__input"
      />
      <span className="mobile-checkbox__checkmark" />
      {label && <span className="mobile-checkbox__label">{label}</span>}
    </label>
  );
};

export default MobileCheckbox;

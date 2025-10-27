export interface AppSwitchProps {
  checked?: boolean;
  disabled?: boolean;
  size?: 'M' | 'L';
  onChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
  'data-testid'?: string;
}

export interface StyledSwitchProps {
  $size: 'M' | 'L';
  $checked: boolean;
  $disabled: boolean;
}

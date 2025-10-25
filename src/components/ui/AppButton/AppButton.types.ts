export interface AppButtonProps {
  children?: React.ReactNode;
  size?: 'M' | 'L';
  variant?: 'primary' | 'secondary' | 'danger' | 'invisible' | 'default';
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onlyIcon?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'data-testid'?: string;
}

export interface StyledButtonProps {
  $size: 'M' | 'L';
  $variant: 'primary' | 'secondary' | 'danger' | 'invisible' | 'default';
  $disabled: boolean;
  $loading: boolean;
  $onlyIcon: boolean;
}
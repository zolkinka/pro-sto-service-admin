export interface AppTagProps {
  children: React.ReactNode;
  size?: 'S' | 'M';
  color?: 'default' | 'blue' | 'red' | 'yellow' | 'green';
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  'data-testid'?: string;
}

export interface StyledTagProps {
  $size: 'S' | 'M';
  $color: 'default' | 'blue' | 'red' | 'yellow' | 'green';
  $closable: boolean;
}

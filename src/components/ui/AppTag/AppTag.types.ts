export interface AppTagProps {
  children: React.ReactNode;
  size?: 'S' | 'M';
  color?: 'default' | 'blue' | 'red' | 'yellow' | 'green';
  closable?: boolean;
  onClose?: () => void;
  className?: string;
  'data-testid'?: string;
}

export interface AppTagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'M' | 'S';
  color?: 'default' | 'blue' | 'red' | 'yellow' | 'green';
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

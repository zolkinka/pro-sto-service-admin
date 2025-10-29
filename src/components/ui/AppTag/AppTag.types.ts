export interface AppTagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'L' | 'M' | 'S';
  color?: 'default' | 'gray' | 'blue' | 'red' | 'yellow' | 'green';
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

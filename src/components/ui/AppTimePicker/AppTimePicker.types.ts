export interface AppTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
  'data-testid'?: string;
}

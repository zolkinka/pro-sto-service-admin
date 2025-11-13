export interface AppTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
  'data-testid'?: string;
  /** Массив доступных временных слотов в формате "HH:mm". Если не указано, генерируются все времена с шагом 15 минут */
  availableSlots?: string[];
  /** Иконка слева от инпута */
  iconLeft?: React.ReactNode;
}

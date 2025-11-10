export type Period = 'day' | 'week';

export interface PeriodSelectorProps {
  value: Period;
  onChange: (value: Period) => void;
  disabled?: boolean;
  className?: string;
}

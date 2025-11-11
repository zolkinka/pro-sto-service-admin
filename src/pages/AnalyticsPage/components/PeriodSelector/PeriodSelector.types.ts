export type Period = 'month' | 'week';

export interface PeriodSelectorProps {
  value: Period;
  onChange: (value: Period) => void;
  disabled?: boolean;
  className?: string;
}

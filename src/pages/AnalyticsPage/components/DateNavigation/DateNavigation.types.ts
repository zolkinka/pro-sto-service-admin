import type { Period } from '../PeriodSelector/PeriodSelector.types';

export interface DateNavigationProps {
  date: Date;
  period: Period;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
}

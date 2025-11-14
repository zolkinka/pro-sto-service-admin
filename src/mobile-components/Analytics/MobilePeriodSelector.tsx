import classNames from 'classnames';
import type { PeriodType } from '../../stores/AnalyticsStore';
import './MobilePeriodSelector.css';

interface MobilePeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  disabled?: boolean;
}

export const MobilePeriodSelector = ({ value, onChange, disabled = false }: MobilePeriodSelectorProps) => {
  return (
    <div className="mobile-period-selector">
      <button
        className={classNames('mobile-period-selector__tab', {
          'mobile-period-selector__tab_active': value === 'month',
        })}
        onClick={() => onChange('month')}
        disabled={disabled}
      >
        День
      </button>
      <button
        className={classNames('mobile-period-selector__tab', {
          'mobile-period-selector__tab_active': value === 'week',
        })}
        onClick={() => onChange('week')}
        disabled={disabled}
      >
        Неделя
      </button>
    </div>
  );
};

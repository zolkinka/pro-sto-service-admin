import React from 'react';
import classNames from 'classnames';
import type { PeriodSelectorProps } from './PeriodSelector.types';
import './PeriodSelector.css';

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, period: 'month' | 'week') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && value !== period) {
        onChange(period);
      }
    }
  };

  return (
    <div className={classNames('period-selector', className)} role="group" aria-label="Выбор периода">
      <button
        type="button"
        className={classNames('period-selector__button', {
          'period-selector__button_active': value === 'month',
        })}
        disabled={disabled}
        onClick={() => !disabled && onChange('month')}
        onKeyDown={(e) => handleKeyDown(e, 'month')}
        aria-pressed={value === 'month'}
        data-testid="period-selector-month"
      >
        Месяц
      </button>
      <button
        type="button"
        className={classNames('period-selector__button', {
          'period-selector__button_active': value === 'week',
        })}
        disabled={disabled}
        onClick={() => !disabled && onChange('week')}
        onKeyDown={(e) => handleKeyDown(e, 'week')}
        aria-pressed={value === 'week'}
        data-testid="period-selector-week"
      >
        Неделя
      </button>
    </div>
  );
};

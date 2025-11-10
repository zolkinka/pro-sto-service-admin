import React from 'react';
import classNames from 'classnames';
import type { StatCardProps } from './StatCard.types';
import './StatCard.css';

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
  loading = false,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  if (loading) {
    return (
      <div className={classNames('stat-card', 'stat-card_loading', className)}>
        <div className="stat-card__header">
          <div className="stat-card__skeleton stat-card__skeleton_title" />
          <div className="stat-card__icon-skeleton" />
        </div>
        <div className="stat-card__skeleton stat-card__skeleton_value" />
        <div className="stat-card__skeleton stat-card__skeleton_change" />
      </div>
    );
  }

  return (
    <div className={classNames('stat-card', className)}>
      <div className="stat-card__header">
        <h3 className="stat-card__title">{title}</h3>
        <div className="stat-card__icon-container">{icon}</div>
      </div>
      
      <div className="stat-card__value">{value}</div>
      
      {change !== undefined && (
        <div
          className={classNames('stat-card__change', {
            'stat-card__change_positive': isPositive,
            'stat-card__change_negative': isNegative,
          })}
        >
          {isPositive && '+'}
          {change}%
        </div>
      )}
    </div>
  );
};

export default StatCard;

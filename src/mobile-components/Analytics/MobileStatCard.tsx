import classNames from 'classnames';
import './MobileStatCard.css';

interface MobileStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

export const MobileStatCard = ({ title, value, change, icon, loading = false }: MobileStatCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  if (loading) {
    return (
      <div className="mobile-stat-card mobile-stat-card_loading">
        <div className="mobile-stat-card__header">
          <div className="mobile-stat-card__skeleton mobile-stat-card__skeleton_title" />
          <div className="mobile-stat-card__skeleton mobile-stat-card__skeleton_icon" />
        </div>
        <div className="mobile-stat-card__skeleton mobile-stat-card__skeleton_value" />
        <div className="mobile-stat-card__skeleton mobile-stat-card__skeleton_change" />
      </div>
    );
  }

  return (
    <div className="mobile-stat-card">
      <div className="mobile-stat-card__header">
        <span className="mobile-stat-card__title">{title}</span>
        <div className="mobile-stat-card__icon">{icon}</div>
      </div>

      <div className="mobile-stat-card__value">{value}</div>

      {change !== undefined && (
        <div
          className={classNames('mobile-stat-card__change', {
            'mobile-stat-card__change_positive': isPositive,
            'mobile-stat-card__change_negative': isNegative,
          })}
        >
          {change}%
        </div>
      )}
    </div>
  );
};

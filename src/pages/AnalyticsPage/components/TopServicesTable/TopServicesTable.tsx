import React from 'react';
import classNames from 'classnames';
import type { TopServicesTableProps } from './TopServicesTable.types';
import './TopServicesTable.css';

const TopServicesTable: React.FC<TopServicesTableProps> = ({
  services,
  loading = false,
  className,
}) => {
  // Состояние загрузки
  if (loading) {
    return (
      <div className={classNames('top-services-table', className)}>
        <div className="top-services-table__header">
          <div className="top-services-table__header-cell">Услуга</div>
          <div className="top-services-table__header-cell">Кол-во записей</div>
          <div className="top-services-table__header-cell">Выручка</div>
        </div>
        <div className="top-services-table__body">
          {[1, 2, 3].map((index) => (
            <div key={index} className="top-services-table__row">
              <div className="top-services-table__cell">
                <div className="top-services-table__skeleton top-services-table__skeleton_name" />
              </div>
              <div className="top-services-table__cell">
                <div className="top-services-table__skeleton top-services-table__skeleton_count" />
              </div>
              <div className="top-services-table__cell">
                <div className="top-services-table__skeleton top-services-table__skeleton_revenue" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Пустое состояние
  if (services.length === 0) {
    return (
      <div className={classNames('top-services-table', 'top-services-table_empty', className)}>
        <div className="top-services-table__header">
          <div className="top-services-table__header-cell">Услуга</div>
          <div className="top-services-table__header-cell">Кол-во записей</div>
          <div className="top-services-table__header-cell">Выручка</div>
        </div>
        <div className="top-services-table__empty-state">
          <p className="top-services-table__empty-text">Нет данных</p>
        </div>
      </div>
    );
  }

  // Обычное состояние с данными
  return (
    <div className={classNames('top-services-table', className)}>
      <div className="top-services-table__header">
        <div className="top-services-table__header-cell">Услуга</div>
        <div className="top-services-table__header-cell">Кол-во записей</div>
        <div className="top-services-table__header-cell">Выручка</div>
      </div>
      <div className="top-services-table__body">
        {services.map((service) => (
          <div key={service.id} className="top-services-table__row">
            <div className="top-services-table__cell top-services-table__cell_name">
              {service.name}
            </div>
            <div className="top-services-table__cell top-services-table__cell_count">
              {service.bookingsCount}
            </div>
            <div className="top-services-table__cell top-services-table__cell_revenue">
              ₽{service.revenue.toLocaleString('ru-RU')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopServicesTable;

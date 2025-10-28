import React from 'react';
import classNames from 'classnames';
import './ServicesSection.css';

interface ServiceCategoryTabsProps {
  activeCategory: 'car_wash' | 'tire_service';
  onCategoryChange: (category: 'car_wash' | 'tire_service') => void;
}

const ServiceCategoryTabs: React.FC<ServiceCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="category-tabs">
      <button
        className={classNames('category-tabs__tab', {
          'category-tabs__tab_active': activeCategory === 'car_wash',
        })}
        onClick={() => onCategoryChange('car_wash')}
      >
        Мойка
      </button>
      <button
        className={classNames('category-tabs__tab', {
          'category-tabs__tab_active': activeCategory === 'tire_service',
        })}
        onClick={() => onCategoryChange('tire_service')}
      >
        Шиномонтаж
      </button>
    </div>
  );
};

export default ServiceCategoryTabs;

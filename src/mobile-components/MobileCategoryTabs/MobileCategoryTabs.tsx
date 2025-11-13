import React from 'react';
import './MobileCategoryTabs.css';

export type CategoryType = 'car_wash' | 'tire_service';

export interface MobileCategoryTabsProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

const MobileCategoryTabs: React.FC<MobileCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="mobile-category-tabs">
      <button
        className={`mobile-category-tabs__tab ${
          activeCategory === 'car_wash' ? 'mobile-category-tabs__tab_active' : ''
        }`}
        onClick={() => onCategoryChange('car_wash')}
        type="button"
      >
        Мойка
      </button>
      <button
        className={`mobile-category-tabs__tab ${
          activeCategory === 'tire_service' ? 'mobile-category-tabs__tab_active' : ''
        }`}
        onClick={() => onCategoryChange('tire_service')}
        type="button"
      >
        Шиномонтаж
      </button>
    </div>
  );
};

export default MobileCategoryTabs;

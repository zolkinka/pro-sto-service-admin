import React from 'react';
import { CategoryTabs, CategoryTab } from './ServicesSection.styles';

interface ServiceCategoryTabsProps {
  activeCategory: 'car_wash' | 'tire_service';
  onCategoryChange: (category: 'car_wash' | 'tire_service') => void;
}

const ServiceCategoryTabs: React.FC<ServiceCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <CategoryTabs>
      <CategoryTab
        $active={activeCategory === 'car_wash'}
        onClick={() => onCategoryChange('car_wash')}
      >
        Мойка
      </CategoryTab>
      <CategoryTab
        $active={activeCategory === 'tire_service'}
        onClick={() => onCategoryChange('tire_service')}
      >
        Шиномонтаж
      </CategoryTab>
    </CategoryTabs>
  );
};

export default ServiceCategoryTabs;

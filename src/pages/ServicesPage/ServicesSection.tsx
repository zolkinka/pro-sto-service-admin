import React from 'react';
import type { ServiceDto } from '../../../services/api-client';
import ServicesTable from './ServicesTable';
import ServiceCategoryTabs from './ServiceCategoryTabs';
import './ServicesSection.css';

interface ServicesSectionProps {
  title: string;
  serviceType: 'main' | 'additional';
  services: ServiceDto[];
  activeCategory: 'car_wash' | 'tire_service';
  onCategoryChange?: (category: 'car_wash' | 'tire_service') => void;
  onAddService: (serviceType: 'main' | 'additional') => void;
  onEditService: (uuid: string) => void;
  onDeleteService: (uuid: string) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  title,
  serviceType,
  services,
  activeCategory,
  onCategoryChange,
  onAddService,
  onEditService,
  onDeleteService,
}) => {
  const showTabs = serviceType === 'main' && onCategoryChange;

  return (
    <div className="services-section">
      {/* Заголовок секции */}
      <div className="services-section__header">
        <div className="services-section__title-wrapper">
          <h2 className="services-section__title">{title}</h2>
          {/* Табы для переключения категорий (только для основных услуг) */}
          {showTabs && (
            <ServiceCategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
            />
          )}
        </div>

        {/* Кнопка добавления услуги */}
        <div className="services-section__add-button-wrapper">
          <span className="services-section__add-text">Добавить услугу</span>
          <button 
            className="services-section__add-button"
            onClick={() => onAddService(serviceType)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4V16M4 10H16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Таблица с услугами */}
      <ServicesTable
        services={services}
        onEditService={onEditService}
        onDeleteService={onDeleteService}
      />
    </div>
  );
};

export default ServicesSection;

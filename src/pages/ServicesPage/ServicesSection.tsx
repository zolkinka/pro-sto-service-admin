import React from 'react';
import type { ServiceDto } from '../../../services/api-client';
import ServicesTable from './ServicesTable';
import ServiceCategoryTabs from './ServiceCategoryTabs';
import {
  SectionContainer,
  SectionHeader,
  SectionTitle,
  Title,
  AddServiceButton,
  AddServiceText,
  AddButton,
} from './ServicesSection.styles';

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
    <SectionContainer>
      {/* Заголовок секции */}
      <SectionHeader>
        <SectionTitle>
          <Title>{title}</Title>
          {/* Табы для переключения категорий (только для основных услуг) */}
          {showTabs && (
            <ServiceCategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
            />
          )}
        </SectionTitle>

        {/* Кнопка добавления услуги */}
        <AddServiceButton>
          <AddServiceText>Добавить услугу</AddServiceText>
          <AddButton onClick={() => onAddService(serviceType)}>
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
          </AddButton>
        </AddServiceButton>
      </SectionHeader>

      {/* Таблица с услугами */}
      <ServicesTable
        services={services}
        onEditService={onEditService}
        onDeleteService={onDeleteService}
      />
    </SectionContainer>
  );
};

export default ServicesSection;

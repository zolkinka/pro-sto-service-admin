import React from 'react';
import type { ServiceDto } from '../../../services/api-client';
import ServiceTableRow from './ServiceTableRow';
import './ServicesTable.css';

interface ServicesTableProps {
  services: ServiceDto[];
  onEditService: (uuid: string) => void;
  onDeleteService: (uuid: string) => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  onEditService,
  onDeleteService,
}) => {
  if (services.length === 0) {
    return (
      <div className="services-table__empty">
        Нет услуг в этой категории
      </div>
    );
  }

  return (
    <div className="services-table">
      {/* Заголовок таблицы */}
      <div className="services-table__row services-table__row_header">
        <div className="services-table__cell services-table__cell_header" style={{ width: 155 }}>
          Название
        </div>
        <div className="services-table__cell services-table__cell_header" style={{ width: 265 }}>
          Описание
        </div>
        <div className="services-table__cell services-table__cell_header" style={{ width: 90 }}>
          Время
        </div>
        <div className="services-table__cell services-table__cell_header" style={{ width: 110 }}>
          Легковой
        </div>
        <div className="services-table__cell services-table__cell_header" style={{ width: 110 }}>
          Кроссовер
        </div>
        <div className="services-table__cell services-table__cell_header" style={{ width: 110 }}>
          Внедорожник
        </div>
        <div className="services-table__cell services-table__cell_header" style={{ width: 110 }}>
          Минивен
        </div>
        <div className="services-table__cell services-table__cell_header" style={{ width: 64 }}>
          {/* Действия */}
        </div>
      </div>

      {/* Строки с услугами */}
      {services.map((service) => (
        <ServiceTableRow
          key={service.uuid}
          service={service}
          onEdit={() => onEditService(service.uuid)}
          onDelete={() => onDeleteService(service.uuid)}
        />
      ))}
    </div>
  );
};

export default ServicesTable;

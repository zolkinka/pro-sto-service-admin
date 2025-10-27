import React from 'react';
import type { ServiceDto } from '../../../services/api-client';
import ServiceTableRow from './ServiceTableRow';
import {
  TableContainer,
  TableHeader,
  TableCell,
} from './ServicesTable.styles';

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
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#888684',
          fontFamily: 'Onest, sans-serif',
        }}
      >
        Нет услуг в этой категории
      </div>
    );
  }

  return (
    <TableContainer>
      {/* Заголовок таблицы */}
      <TableHeader>
        <TableCell width={155} $isHeader>
          Название
        </TableCell>
        <TableCell width={265} $isHeader>
          Описание
        </TableCell>
        <TableCell width={90} $isHeader>
          Время
        </TableCell>
        <TableCell width={110} $isHeader>
          Легковой
        </TableCell>
        <TableCell width={110} $isHeader>
          Кроссовер
        </TableCell>
        <TableCell width={110} $isHeader>
          Внедорожник
        </TableCell>
        <TableCell width={110} $isHeader>
          Минивен
        </TableCell>
        <TableCell width={64} $isHeader>
          {/* Действия */}
        </TableCell>
      </TableHeader>

      {/* Строки с услугами */}
      {services.map((service) => (
        <ServiceTableRow
          key={service.uuid}
          service={service}
          onEdit={() => onEditService(service.uuid)}
          onDelete={() => onDeleteService(service.uuid)}
        />
      ))}
    </TableContainer>
  );
};

export default ServicesTable;

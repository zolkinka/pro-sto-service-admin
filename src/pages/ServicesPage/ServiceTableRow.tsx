import React from 'react';
import type { ServiceDto } from '../../../services/api-client';
import { formatPrice } from '../../utils/helpers';
import './ServicesTable.css';

interface ServiceTableRowProps {
  service: ServiceDto;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Функция для извлечения цены по классу автомобиля из servicePrices
 */
const getServicePrice = (
  service: ServiceDto,
  carClass: 'sedan' | 'crossover' | 'suv' | 'minivan'
): number | null => {
  const priceObj = service.servicePrices?.find(
    (p: { parameter_type?: string; parameter_value?: string; is_active?: boolean; price?: number }) =>
      p.parameter_type === 'simple_car_class' &&
      p.parameter_value === carClass &&
      p.is_active
  );
  return priceObj?.price ?? null;
};

const ServiceTableRow: React.FC<ServiceTableRowProps> = ({
  service,
  onEdit,
  onDelete,
}) => {
  const sedanPrice = getServicePrice(service, 'sedan');
  const crossoverPrice = getServicePrice(service, 'crossover');
  const suvPrice = getServicePrice(service, 'suv');
  const minivanPrice = getServicePrice(service, 'minivan');

  return (
    <div className="services-table__row">
      {/* Название */}
      <div className="services-table__cell" style={{ width: 155 }}>
        {service.name}
      </div>

      {/* Описание */}
      <div className="services-table__cell services-table__cell_secondary" style={{ width: 265 }}>
        {service.description || '—'}
      </div>

      {/* Время */}
      <div className="services-table__cell services-table__cell_secondary" style={{ width: 90 }}>
        {service.duration_minutes} мин
      </div>

      {/* Легковой */}
      <div className="services-table__cell" style={{ width: 110 }}>
        {sedanPrice ? `${formatPrice(sedanPrice)}₽` : '—'}
      </div>

      {/* Кроссовер */}
      <div className="services-table__cell" style={{ width: 110 }}>
        {crossoverPrice ? `${formatPrice(crossoverPrice)}₽` : '—'}
      </div>

      {/* Внедорожник */}
      <div className="services-table__cell" style={{ width: 110 }}>
        {suvPrice ? `${formatPrice(suvPrice)}₽` : '—'}
      </div>

      {/* Минивен */}
      <div className="services-table__cell" style={{ width: 110 }}>
        {minivanPrice ? `${formatPrice(minivanPrice)}₽` : '—'}
      </div>

      {/* Действия */}
      <div className="services-table__cell services-table__cell_actions" style={{ width: 64 }}>
        <button className="services-table__icon-button" onClick={onEdit} title="Редактировать">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button className="services-table__icon-button" onClick={onDelete} title="Удалить">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6H5H21"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ServiceTableRow;

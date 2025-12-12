import React from 'react';
import type { ServiceDto } from '../../../services/api-client';
import { EditIcon, TrashIcon } from '../../components/ui/icons';
import { formatPrice } from '@/utils/helpers';
import './MobileServiceCard.css';

export interface MobileServiceCardProps {
  service: ServiceDto;
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string) => void;
}

// Маппинг классов авто на читаемые названия
const CAR_CLASS_LABELS: Record<string, string> = {
  sedan: 'Легковой',
  crossover: 'Кроссовер',
  suv: 'Внедорожник',
  minivan: 'Минивен',
};

const MobileServiceCard: React.FC<MobileServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
}) => {
  // Получаем цены для каждого класса авто
  const getPriceByClass = (carClass: string): number => {
    const priceItem = service.servicePrices?.find(
      (p) => p.parameter_value === carClass && p.parameter_type === 'simple_car_class'
    );
    return priceItem?.price || 0;
  };

  const carClasses = ['sedan', 'crossover', 'suv', 'minivan'];

  return (
    <div className="mobile-service-card">
      <div className="mobile-service-card__header">
        <div className="mobile-service-card__description">
          <h3 className="mobile-service-card__title">{service.name}</h3>
          {service.description && (
            <p className="mobile-service-card__subtitle">{service.description}</p>
          )}
        </div>
        <div className="mobile-service-card__buttons">
          <button
            className="mobile-service-card__button"
            onClick={() => onEdit(service.uuid)}
            type="button"
            aria-label="Редактировать услугу"
          >
            <EditIcon />
          </button>
          <button
            className="mobile-service-card__button"
            onClick={() => onDelete(service.uuid)}
            type="button"
            aria-label="Удалить услугу"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="mobile-service-card__prices">
        {carClasses.map((carClass) => {
          const price = getPriceByClass(carClass);
          return (
            <div key={carClass} className="mobile-service-card__price-item">
              <span className="mobile-service-card__price-label">
                {CAR_CLASS_LABELS[carClass]}
              </span>
              <span className="mobile-service-card__price-value">{formatPrice(price)}₽</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileServiceCard;

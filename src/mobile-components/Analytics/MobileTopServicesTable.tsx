import './MobileTopServicesTable.css';

export interface TopService {
  id: string;
  name: string;
  bookingsCount: number;
  revenue: number;
}

interface MobileTopServicesTableProps {
  services: TopService[];
  loading?: boolean;
}

export const MobileTopServicesTable = ({ services, loading = false }: MobileTopServicesTableProps) => {
  // Показываем только первые 6 услуг
  const displayedServices = services.slice(0, 6);

  if (loading) {
    return (
      <div className="mobile-top-services-table">
        <div className="mobile-top-services-table__header">
          <h3 className="mobile-top-services-table__title">Топ услуги</h3>
        </div>
        <div className="mobile-top-services-table__table">
          <div className="mobile-top-services-table__thead">
            <div className="mobile-top-services-table__row">
              <div className="mobile-top-services-table__th mobile-top-services-table__th_service">
                Услуга
              </div>
              <div className="mobile-top-services-table__th mobile-top-services-table__th_bookings">
                Записи
              </div>
              <div className="mobile-top-services-table__th mobile-top-services-table__th_revenue">
                Выручка
              </div>
            </div>
          </div>
          <div className="mobile-top-services-table__tbody">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="mobile-top-services-table__row mobile-top-services-table__row_skeleton">
                <div className="mobile-top-services-table__td mobile-top-services-table__td_service">
                  <div className="mobile-top-services-table__skeleton" />
                </div>
                <div className="mobile-top-services-table__td mobile-top-services-table__td_bookings">
                  <div className="mobile-top-services-table__skeleton" />
                </div>
                <div className="mobile-top-services-table__td mobile-top-services-table__td_revenue">
                  <div className="mobile-top-services-table__skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (displayedServices.length === 0) {
    return (
      <div className="mobile-top-services-table">
        <div className="mobile-top-services-table__header">
          <h3 className="mobile-top-services-table__title">Топ услуги</h3>
        </div>
        <div className="mobile-top-services-table__empty">Нет данных</div>
      </div>
    );
  }

  return (
    <div className="mobile-top-services-table">
      <div className="mobile-top-services-table__table">
        <div className="mobile-top-services-table__thead">
          <div className="mobile-top-services-table__row">
            <div className="mobile-top-services-table__th mobile-top-services-table__th_service">
              Услуга
            </div>
            <div className="mobile-top-services-table__th mobile-top-services-table__th_bookings">
              Записи
            </div>
            <div className="mobile-top-services-table__th mobile-top-services-table__th_revenue">
              Выручка
            </div>
          </div>
        </div>
        <div className="mobile-top-services-table__tbody">
          {displayedServices.map((service) => (
            <div key={service.id} className="mobile-top-services-table__row">
              <div className="mobile-top-services-table__td mobile-top-services-table__td_service">
                {service.name}
              </div>
              <div className="mobile-top-services-table__td mobile-top-services-table__td_bookings">
                {service.bookingsCount}
              </div>
              <div className="mobile-top-services-table__td mobile-top-services-table__td_revenue">
                {service.revenue.toLocaleString('ru-RU')}₽
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

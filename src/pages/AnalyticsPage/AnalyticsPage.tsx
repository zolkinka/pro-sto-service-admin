import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks';
import { NotesIcon, TaskCheckIcon, TaskMinusIcon, CardIcon } from '../../components/ui/icons';
import {
  StatCard,
  TopServicesTable,
  LoadChart,
  DateNavigation,
  PeriodSelector,
} from './components';
import type { ServiceData, ChartDataPoint } from './components';
import './AnalyticsPage.css';

const AnalyticsPage = observer(() => {
  const { analyticsStore, authStore } = useStores();

  // Инициализация: установка serviceCenterUuid и загрузка данных
  useEffect(() => {
    if (authStore.user?.service_center_uuid) {
      analyticsStore.setServiceCenterUuid(authStore.user.service_center_uuid);
      analyticsStore.fetchAll();
    }
  }, [authStore.user?.service_center_uuid, analyticsStore]);

  // Перезагрузка данных при изменении периода или даты
  useEffect(() => {
    if (analyticsStore.serviceCenterUuid) {
      analyticsStore.fetchAll();
    }
  }, [analyticsStore.periodType, analyticsStore.currentDate, analyticsStore]);

  // Обработчики для PeriodSelector и DateNavigation
  const handlePeriodChange = (period: 'day' | 'week') => {
    analyticsStore.setPeriodType(period);
  };

  const handlePreviousPeriod = () => {
    analyticsStore.navigateToPreviousPeriod();
  };

  const handleNextPeriod = () => {
    analyticsStore.navigateToNextPeriod();
  };

  // Маппинг данных для компонентов
  const mappedServices: ServiceData[] = analyticsStore.topServices.map((service) => ({
    id: service.service_uuid,
    name: service.service_name,
    bookingsCount: service.bookings_count,
    revenue: service.revenue,
  }));

  const mappedChartData: ChartDataPoint[] =
    analyticsStore.loadChartData?.load_data.map((point) => ({
      label: point.label,
      value: point.bookings_count,
    })) || [];

  return (
    <div className="analytics-page">
      <div className="analytics-page__wrapper">
        <div className="analytics-page__container">
          {/* Header */}
          <div className="analytics-page__header">
            <PeriodSelector
              value={analyticsStore.periodType}
              onChange={handlePeriodChange}
              disabled={analyticsStore.isLoading}
            />
            <DateNavigation
              date={analyticsStore.currentDate}
              period={analyticsStore.periodType}
              onPrevious={handlePreviousPeriod}
              onNext={handleNextPeriod}
              disabled={analyticsStore.isLoading}
            />
          </div>

          {/* Stats Cards */}
          <div className="analytics-page__stats">
            <StatCard
              title="Записи"
              icon={<NotesIcon />}
              value={analyticsStore.stats?.total_bookings.current ?? 0}
              change={analyticsStore.stats?.total_bookings.change_percent}
              loading={analyticsStore.isLoading}
            />
            <StatCard
              title="Подтверждений"
              icon={<TaskCheckIcon />}
              value={analyticsStore.stats?.confirmed_bookings.current ?? 0}
              change={analyticsStore.stats?.confirmed_bookings.change_percent}
              loading={analyticsStore.isLoading}
            />
            <StatCard
              title="Не состоявшихся"
              icon={<TaskMinusIcon />}
              value={analyticsStore.stats?.cancelled_bookings.current ?? 0}
              change={analyticsStore.stats?.cancelled_bookings.change_percent}
              loading={analyticsStore.isLoading}
            />
            <StatCard
              title="Выручка"
              icon={<CardIcon />}
              value={`₽${(analyticsStore.stats?.revenue.current ?? 0).toLocaleString('ru-RU')}`}
              change={analyticsStore.stats?.revenue.change_percent}
              loading={analyticsStore.isLoading}
            />
          </div>

          {/* Content */}
          <div className="analytics-page__content">
            <TopServicesTable services={mappedServices} loading={analyticsStore.isLoading} />
            <LoadChart data={mappedChartData} loading={analyticsStore.isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default AnalyticsPage;

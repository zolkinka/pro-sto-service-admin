import { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks';
import { NotesIcon, TaskCheckIcon, TaskMinusIcon, CardIcon } from '../../components/ui/icons';
import {
  MobilePeriodSelector,
  MobileDateNavigation,
  MobileStatCard,
  MobileTopServicesTable,
  MobileLoadChart,
} from '@/mobile-components/Analytics';
import type { TopService, ChartDataPoint } from '@/mobile-components/Analytics';
import './MobileAnalyticsPage.css';

const MobileAnalyticsPage = observer(() => {
  const { analyticsStore, authStore } = useStores();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

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

  // Pull-to-refresh implementation
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop === 0 && !analyticsStore.isLoading) {
        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;

        if (diff > 0 && diff < 100) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      const diff = currentY.current - startY.current;

      if (diff > 80 && !analyticsStore.isLoading) {
        setIsRefreshing(true);
        await analyticsStore.fetchAll();
        setIsRefreshing(false);
      }

      startY.current = 0;
      currentY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [analyticsStore]);

  // Обработчики
  const handlePeriodChange = (period: 'month' | 'week') => {
    analyticsStore.setPeriodType(period);
  };

  const handlePreviousPeriod = () => {
    analyticsStore.navigateToPreviousPeriod();
  };

  const handleNextPeriod = () => {
    analyticsStore.navigateToNextPeriod();
  };

  // Маппинг данных
  const mappedServices: TopService[] = analyticsStore.topServices.slice(0, 6).map((service) => ({
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
    <div className="mobile-analytics-page" ref={scrollContainerRef}>
      {/* Pull-to-refresh indicator */}
      {isRefreshing && <div className="mobile-analytics-page__refresh-indicator">Обновление...</div>}

      {/* Content */}
      <div className="mobile-analytics-page__content">
        {/* Controls */}
        <div className="mobile-analytics-page__controls">
          <MobilePeriodSelector
            value={analyticsStore.periodType}
            onChange={handlePeriodChange}
            disabled={analyticsStore.isLoading}
          />
        </div>
        <div className="mobile-analytics-page__navigation">
          <MobileDateNavigation
            formattedDate={analyticsStore.formattedDate}
            onPrevious={handlePreviousPeriod}
            onNext={handleNextPeriod}
            disabled={analyticsStore.isLoading}
          />
        </div>

        {/* Stat Cards Grid */}
        <div className="mobile-analytics-page__stats">
          <div className="mobile-analytics-page__stats-row">
            <MobileStatCard
              title="Записи"
              value={
                typeof analyticsStore.stats?.total_bookings === 'object'
                  ? analyticsStore.stats.total_bookings.current
                  : analyticsStore.stats?.total_bookings ?? 0
              }
              change={
                typeof analyticsStore.stats?.total_bookings === 'object'
                  ? analyticsStore.stats.total_bookings.change_percent
                  : undefined
              }
              icon={<NotesIcon size={16} />}
              loading={analyticsStore.isLoading}
            />
            <MobileStatCard
              title="Подтверждений"
              value={
                typeof analyticsStore.stats?.confirmed_bookings === 'object'
                  ? analyticsStore.stats.confirmed_bookings.current
                  : analyticsStore.stats?.confirmed_bookings ?? 0
              }
              change={
                typeof analyticsStore.stats?.confirmed_bookings === 'object'
                  ? analyticsStore.stats.confirmed_bookings.change_percent
                  : undefined
              }
              icon={<TaskCheckIcon size={16} />}
              loading={analyticsStore.isLoading}
            />
          </div>
          <div className="mobile-analytics-page__stats-row">
            <MobileStatCard
              title="Не состоявшихся"
              value={
                typeof analyticsStore.stats?.cancelled_bookings === 'object'
                  ? analyticsStore.stats.cancelled_bookings.current
                  : analyticsStore.stats?.cancelled_bookings ?? 0
              }
              change={
                typeof analyticsStore.stats?.cancelled_bookings === 'object'
                  ? analyticsStore.stats.cancelled_bookings.change_percent
                  : undefined
              }
              icon={<TaskMinusIcon size={16} />}
              loading={analyticsStore.isLoading}
            />
            <MobileStatCard
              title="Выручка"
              value={`${(
                typeof analyticsStore.stats?.revenue === 'object'
                  ? analyticsStore.stats.revenue.current
                  : analyticsStore.stats?.revenue ?? 0
              ).toLocaleString('ru-RU')} ₽`}
              change={
                typeof analyticsStore.stats?.revenue === 'object'
                  ? analyticsStore.stats.revenue.change_percent
                  : undefined
              }
              icon={<CardIcon size={16} />}
              loading={analyticsStore.isLoading}
            />
          </div>
        </div>

        {/* Top Services Table */}
        <MobileTopServicesTable services={mappedServices} loading={analyticsStore.isLoading} />

        {/* Load Chart */}
        <MobileLoadChart data={mappedChartData} loading={analyticsStore.isLoading} />
      </div>
    </div>
  );
});

export default MobileAnalyticsPage;

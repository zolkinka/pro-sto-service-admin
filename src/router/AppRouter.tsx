import { Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ROUTES } from '@/constants/routes';
import { authStore } from '@/stores/AuthStore';
import AppLayout from '@/components/Layout/AppLayout';
import { MobileLayout } from '@/components/Layout';
import { PlatformRoute } from './PlatformRoute';
import { usePlatform } from '@/hooks';
import { 
  Dashboard, 
  NotFound, 
  AuthPhonePage,
  MobileAuthPhonePage,
  AuthCodePage,
  MobileAuthCodePage,
  OrdersPage,
  MobileOrdersPage,
  AnalyticsPage,
  SchedulePage,
  MobileSchedulePage,
  SettingsPage,
  PaymentMockPage
} from '@/pages';
import { MobileBookingDetails, MobileCreateBooking } from '@/mobile-components';
import ServicesPageWrapper from '@/pages/ServicesPage';

/**
 * ProtectedLayout - Layout wrapper для защищенных маршрутов
 * Выбирает между MobileLayout и AppLayout в зависимости от платформы
 * Проверяет авторизацию и редиректит на страницу входа при необходимости
 */
const ProtectedLayout = observer(() => {
  const platform = usePlatform();
  
  if (!authStore.isAuthenticated) {
    return <Navigate to={ROUTES.AUTH_PHONE} replace />;
  }

  // MobileLayout и AppLayout оба используют Outlet для рендера дочерних маршрутов
  return platform === 'mobile' ? <MobileLayout /> : <AppLayout><div /></AppLayout>;
});

/**
 * PrivateRoute - обертка для отдельных защищенных страниц без layout
 * Используется для desktop версии, где AppLayout принимает children
 */
const PrivateRoute = observer(({ children }: { children: React.ReactNode }) => {
  const platform = usePlatform();
  
  if (!authStore.isAuthenticated) {
    return <Navigate to={ROUTES.AUTH_PHONE} replace />;
  }

  return platform === 'mobile' ? <>{children}</> : <AppLayout>{children}</AppLayout>;
});

const AppRouter = observer(() => {
  const platform = usePlatform();
  
  return (
    <Routes>
      {/* Редирект с корня на /orders */}
      <Route path="/" element={<Navigate to={ROUTES.ORDERS} replace />} />
      
      {/* Публичные маршруты авторизации (без MainLayout) */}
      <Route 
        path={ROUTES.AUTH_PHONE} 
        element={
          <PlatformRoute 
            desktop={AuthPhonePage} 
            mobile={MobileAuthPhonePage}
          />
        } 
      />
      <Route 
        path={ROUTES.AUTH_CODE} 
        element={
          <PlatformRoute 
            desktop={AuthCodePage} 
            mobile={MobileAuthCodePage}
          />
        } 
      />
      
      {/* Публичный маршрут для мок-платежа (без авторизации и без Layout) */}
      <Route path={ROUTES.PAYMENT_MOCK} element={<PaymentMockPage />} />

      {/* Защищенные маршруты - используем layout route для mobile */}
      {platform === 'mobile' ? (
        <>
          <Route element={<ProtectedLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.SERVICES} element={<ServicesPageWrapper />} />
            <Route path={ROUTES.ORDERS} element={<MobileOrdersPage />} />
            <Route path="/orders/:uuid" element={<MobileBookingDetails />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route 
              path={ROUTES.SCHEDULE} 
              element={
                <PlatformRoute 
                  desktop={SchedulePage} 
                  mobile={MobileSchedulePage}
                />
              } 
            />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>
          {/* Страница создания заказа без layout */}
          <Route path="/orders/create" element={<PrivateRoute><MobileCreateBooking /></PrivateRoute>} />
        </>
      ) : (
        <>
          <Route path={ROUTES.DASHBOARD} element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path={ROUTES.SERVICES} element={<PrivateRoute><ServicesPageWrapper /></PrivateRoute>} />
          <Route path={ROUTES.ORDERS} element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path={ROUTES.ANALYTICS} element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
          <Route 
            path={ROUTES.SCHEDULE} 
            element={
              <PrivateRoute>
                <PlatformRoute 
                  desktop={SchedulePage} 
                  mobile={MobileSchedulePage}
                />
              </PrivateRoute>
            } 
          />
          <Route path={ROUTES.SETTINGS} element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        </>
      )}

      {/* 404 страница */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      
      {/* Перенаправление всех неизвестных маршрутов на 404 */}
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
});

AppRouter.displayName = 'AppRouter';

export default AppRouter;
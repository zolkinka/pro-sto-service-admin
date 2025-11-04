import { Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ROUTES } from '@/constants/routes';
import { authStore } from '@/stores/AuthStore';
import AppLayout from '@/components/Layout/AppLayout';
import { 
  Dashboard, 
  NotFound, 
  AuthPhonePage, 
  AuthCodePage,
  ServicesPage,
  OrdersPage,
  AnalyticsPage,
  SchedulePage,
  SettingsPage,
  PaymentMockPage
} from '@/pages';

/**
 * PrivateRoute - защищенный маршрут, доступный только авторизованным пользователям
 * Если пользователь не авторизован - редирект на страницу входа
 * Оборачивает содержимое в AppLayout с фиксированным Header
 */
const PrivateRoute = observer(({ children }: { children: React.ReactNode }) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to={ROUTES.AUTH_PHONE} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
});

const AppRouter = observer(() => {
  return (
    <Routes>
      {/* Редирект с корня на /orders */}
      <Route path="/" element={<Navigate to={ROUTES.ORDERS} replace />} />
      
      {/* Публичные маршруты авторизации (без MainLayout) */}
      <Route path={ROUTES.AUTH_PHONE} element={<AuthPhonePage />} />
      <Route path={ROUTES.AUTH_CODE} element={<AuthCodePage />} />
      
      {/* Публичный маршрут для мок-платежа (без авторизации и без Layout) */}
      <Route path={ROUTES.PAYMENT_MOCK} element={<PaymentMockPage />} />

      {/* Защищенные маршруты (с MainLayout) */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path={ROUTES.SERVICES}
        element={
          <PrivateRoute>
            <ServicesPage />
          </PrivateRoute>
        }
      />

      <Route
        path={ROUTES.ORDERS}
        element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        }
      />

      <Route
        path={ROUTES.ANALYTICS}
        element={
          <PrivateRoute>
            <AnalyticsPage />
          </PrivateRoute>
        }
      />

      <Route
        path={ROUTES.SCHEDULE}
        element={
          <PrivateRoute>
            <SchedulePage />
          </PrivateRoute>
        }
      />

      <Route
        path={ROUTES.SETTINGS}
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        }
      />

      {/* 404 страница */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      
      {/* Перенаправление всех неизвестных маршрутов на 404 */}
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
});

AppRouter.displayName = 'AppRouter';

export default AppRouter;
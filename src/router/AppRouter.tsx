import { Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ROUTES } from '@/constants/routes';
import { authStore } from '@/stores/AuthStore';
import { MainLayout } from '@/components/Layout';
import { Dashboard, NotFound, AuthPhonePage, AuthCodePage } from '@/pages';

/**
 * PrivateRoute - защищенный маршрут, доступный только авторизованным пользователям
 * Если пользователь не авторизован - редирект на страницу входа
 * Оборачивает содержимое в MainLayout с Header и Sidebar
 */
const PrivateRoute = observer(({ children }: { children: React.ReactNode }) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to={ROUTES.AUTH_PHONE} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
});

const AppRouter = observer(() => {
  return (
    <Routes>
      {/* Публичные маршруты авторизации (без MainLayout) */}
      <Route path={ROUTES.AUTH_PHONE} element={<AuthPhonePage />} />
      <Route path={ROUTES.AUTH_CODE} element={<AuthCodePage />} />

      {/* Защищенные маршруты (с MainLayout) */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <PrivateRoute>
            <Dashboard />
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
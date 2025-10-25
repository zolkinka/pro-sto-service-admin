import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import { ButtonShowcase } from '@/pages/ButtonShowcase';

const AppRouter = () => {
  return (
    <Routes>
      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
      <Route path={ROUTES.BUTTON_SHOWCASE} element={<ButtonShowcase />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
};

export default AppRouter;
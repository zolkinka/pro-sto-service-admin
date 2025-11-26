import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ToastProvider, useToast } from '@/components/ui/AppToast';
import { toastStore } from '@/stores/ToastStore';
import { PendingBookingsChecker } from '@/components/PendingBookingsChecker';
import AppRouter from '@/router';

// Компонент для инициализации ToastStore
const ToastInitializer = observer(() => {
  const { showToast } = useToast();

  useEffect(() => {
    // Инициализируем ToastStore с функцией showToast из React Context
    toastStore.initialize(showToast);
  }, [showToast]);

  return null;
});

const App = observer(() => {
  return (
    <ToastProvider position="top-right" maxToasts={3}>
      <ToastInitializer />
      <PendingBookingsChecker />
      <AppRouter />
    </ToastProvider>
  );
});

App.displayName = 'App';

export default App;

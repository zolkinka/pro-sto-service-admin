import type { ReactNode } from 'react';
import { rootStore } from './RootStore';
import type { RootStore } from './RootStore';
import { StoreContext } from './context';

// Store provider component
interface StoreProviderProps {
  children: ReactNode;
  store?: RootStore;
}

export function StoreProvider({ children, store = rootStore }: StoreProviderProps) {
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}
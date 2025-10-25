import { useContext } from 'react';
import { StoreContext } from '@/stores/context';

/**
 * Custom hook to access stores from context
 */
export const useStores = () => {
  const stores = useContext(StoreContext);
  
  if (!stores) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  
  return stores;
};
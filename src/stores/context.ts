import { createContext } from 'react';
import { rootStore } from './RootStore';
import type { RootStore } from './RootStore';

// Create context for the stores
export const StoreContext = createContext<RootStore>(rootStore);
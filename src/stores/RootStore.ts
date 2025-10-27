import { makeAutoObservable } from 'mobx';
import { AuthStore, authStore } from './AuthStore';
import { ToastStore, toastStore } from './ToastStore';

/**
 * Root store that combines all application stores
 */
export class RootStore {
  authStore: AuthStore;
  toastStore: ToastStore;

  constructor() {
    // Используем singleton instances
    this.authStore = authStore;
    this.toastStore = toastStore;
    
    makeAutoObservable(this);
  }
}

// Create a single instance of the root store
export const rootStore = new RootStore();
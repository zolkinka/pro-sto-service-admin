import { makeAutoObservable } from 'mobx';
import { AuthStore, authStore } from './AuthStore';
import { ToastStore, toastStore } from './ToastStore';
import { ServicesStore, servicesStore } from './ServicesStore';
import { BookingsStore, bookingsStore } from './BookingsStore';

/**
 * Root store that combines all application stores
 */
export class RootStore {
  authStore: AuthStore;
  toastStore: ToastStore;
  servicesStore: ServicesStore;
  bookingsStore: BookingsStore;

  constructor() {
    // Используем singleton instances
    this.authStore = authStore;
    this.toastStore = toastStore;
    this.servicesStore = servicesStore;
    this.bookingsStore = bookingsStore;
    
    makeAutoObservable(this);
  }
}

// Create a single instance of the root store
export const rootStore = new RootStore();
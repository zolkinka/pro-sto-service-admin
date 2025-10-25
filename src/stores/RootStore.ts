import { makeAutoObservable } from 'mobx';

/**
 * Root store that combines all application stores
 */
export class RootStore {
  constructor() {
    makeAutoObservable(this);
  }

  // Here we will add other stores as properties
  // For example:
  // authStore = new AuthStore(this);
  // uiStore = new UIStore(this);
}

// Create a single instance of the root store
export const rootStore = new RootStore();
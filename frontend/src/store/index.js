// stores/index.js
// Central export for all Zustand stores

import { useAdminStore } from './useAdminStore.js';
import { usePropertyStore } from './usePropertyStore.js';
import { useContentStore } from './useContentStore.js';
import { useDashboardStore } from './useDashboardStore.js';

export { useAdminStore } from './useAdminStore.js';
export { useDashboardStore } from './useDashboardStore.js';
export { useContentStore } from './useContentStore.js';
export { usePropertyStore } from './usePropertyStore.js';

// Store initialization function
export const initializeStores = async () => {
  // Initialize admin store if token exists
  const { initialize: initAdmin } = useAdminStore.getState();
  await initAdmin();
  
  console.log('All stores initialized');
};

// Store cleanup function (useful for logout)
export const clearAllStores = () => {
  const { clearState: clearAdmin } = useAdminStore.getState();
  const { clearStats: clearDashboard } = useDashboardStore.getState();
  const { clearContentData: clearContent } = useContentStore.getState();
  
  clearAdmin();
  clearDashboard();
  clearContent();
  
  console.log('All stores cleared');
};

// Combined loading state hook
export const useGlobalLoading = () => {
  const adminLoading = useAdminStore(state => state.isLoading);
  const dashboardLoading = useDashboardStore(state => state.isLoading);
  const contentLoading = useContentStore(state => state.isLoading);
  const propertyLoading = usePropertyStore(state => state.isLoading);
  
  return adminLoading || dashboardLoading || contentLoading || propertyLoading;
};

// Combined error state hook
export const useGlobalError = () => {
  const adminError = useAdminStore(state => state.error);
  const dashboardError = useDashboardStore(state => state.error);
  const contentError = useContentStore(state => state.error);
  const propertyError = usePropertyStore(state => state.error);

  return adminError || dashboardError || contentError || propertyError;
};
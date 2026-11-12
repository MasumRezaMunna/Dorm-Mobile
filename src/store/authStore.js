/**
 * Auth store stub — authentication has been removed from the mobile application.
 * All public screens operate in guest/companion mode.
 */
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isPending: false,
  hydrate: async () => {},
  setAuth: async () => {},
  logout: async () => {},
  forceLogout: async () => {},
  refreshPendingStatus: async () => {},
  isAuthenticated: () => false,
  isManager: () => false,
}));

export default useAuthStore;

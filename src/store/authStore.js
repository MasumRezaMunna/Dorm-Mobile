/**
 * Zustand auth store with SecureStore persistence.
 *
 * State:
 *  - user       : The decoded backend user object { _id, email, displayName, role, ... }
 *  - token      : Backend JWT string
 *  - isLoading  : Hydration state (true until SecureStore is read)
 *  - isPending  : Member exists but status !== 'active'
 *
 * The store is the single source of truth for auth state in the mobile app,
 * replacing the web's AuthContext + localStorage pattern.
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';

const TOKEN_KEY = '467home_jwt';

const useAuthStore = create((set, get) => ({
  user:      null,
  token:     null,
  isLoading: true,   // true until hydration completes
  isPending: false,

  // ─── Hydrate from SecureStore on app start ───────────────────────────────
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        set({ token });
        // Validate token and get fresh user data
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = data.data;
        const isPending = await checkMemberPending(user, token);
        set({ user, isPending });
      }
    } catch {
      // Token expired or invalid — clear it
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      set({ user: null, token: null, isPending: false });
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Set auth after successful Google login ───────────────────────────────
  setAuth: async ({ user, token }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    const isPending = await checkMemberPending(user, token);
    set({ user, token, isPending, isLoading: false });
  },

  // ─── Logout ───────────────────────────────────────────────────────────────
  logout: async () => {
    const token = get().token;
    try {
      if (token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      await signOut(auth).catch(() => {});
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      set({ user: null, token: null, isPending: false, isLoading: false });
    }
  },

  // ─── Refresh pending status (called from pending screen) ──────────────────
  refreshPendingStatus: async () => {
    const { user, token } = get();
    if (!user) return;
    const isPending = await checkMemberPending(user, token);
    set({ isPending });
  },

  // ─── Called by API interceptor on 401 ────────────────────────────────────
  forceLogout: async () => {
    await signOut(auth).catch(() => {});
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    set({ user: null, token: null, isPending: false, isLoading: false });
  },

  // ─── Computed selectors ───────────────────────────────────────────────────
  isAuthenticated: () => !!(get().token && get().user),
  isManager: () => get().user?.role === 'manager',
}));

// ─── Helper: check if member profile is active ───────────────────────────────
async function checkMemberPending(user, token) {
  if (!user || user.role !== 'member') return false;
  try {
    const { data } = await api.get('/members/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return !data.data || data.data.status !== 'active';
  } catch {
    return true;
  }
}

export default useAuthStore;

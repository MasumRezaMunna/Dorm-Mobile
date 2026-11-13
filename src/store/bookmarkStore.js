/**
 * Offline-friendly Bookmark Store using Zustand + AsyncStorage.
 * Allows residents and visitors to bookmark important notices for instant access.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@dorm_bookmarked_notices';

export const useBookmarkStore = create((set, get) => ({
  bookmarkedIds: [],
  isLoaded: false,

  loadBookmarks: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ bookmarkedIds: JSON.parse(stored), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.warn('Failed to load bookmarks', e);
      set({ isLoaded: true });
    }
  },

  toggleBookmark: async (noticeId) => {
    const { bookmarkedIds } = get();
    const isBookmarked = bookmarkedIds.includes(noticeId);
    const updated = isBookmarked
      ? bookmarkedIds.filter((id) => id !== noticeId)
      : [...bookmarkedIds, noticeId];

    set({ bookmarkedIds: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save bookmark', e);
    }
    return !isBookmarked;
  },

  isBookmarked: (noticeId) => {
    return get().bookmarkedIds.includes(noticeId);
  },
}));

// Initialize store immediately
useBookmarkStore.getState().loadBookmarks();

export default useBookmarkStore;


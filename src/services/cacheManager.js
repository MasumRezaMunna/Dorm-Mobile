/**
 * Cache Manager Service
 * Provides offline-first caching, memory management, metrics, and cache invalidation.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@home_cache_';
export const QUERY_PERSIST_KEY = 'HOME_APP_OFFLINE_CACHE';

/**
 * Format raw byte size into human readable string (B, KB, MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 KB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i === 0) return `${bytes} Bytes`;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Store item in cache with optional TTL (Time To Live in ms)
 */
export async function setCache(key, data, ttlMs = 24 * 60 * 60 * 1000) {
  try {
    const payload = {
      data,
      timestamp: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[CacheManager] Error saving to cache:', error);
    return false;
  }
}

/**
 * Retrieve item from cache (validates expiration)
 */
export async function getCache(key) {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      // Expired, clear asynchronously
      AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`).catch(() => {});
      return null;
    }
    return payload.data;
  } catch (error) {
    console.warn('[CacheManager] Error reading from cache:', error);
    return null;
  }
}

/**
 * Remove a specific cache key
 */
export async function removeCache(key) {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.warn('[CacheManager] Error removing cache key:', error);
  }
}

/**
 * Compute total cache memory usage metrics
 */
export async function getCacheMetrics() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(
      (k) => k.startsWith(CACHE_PREFIX) || k === QUERY_PERSIST_KEY || k.startsWith('@dorm_')
    );

    let totalBytes = 0;
    for (const key of cacheKeys) {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          // Approximate string size in bytes (2 bytes per UTF-16 character)
          totalBytes += item.length * 2;
        }
      } catch {
        // Continue loop if one key fails
      }
    }

    return {
      keyCount: cacheKeys.length,
      totalBytes,
      formattedSize: formatBytes(totalBytes),
    };
  } catch (error) {
    console.warn('[CacheManager] Error calculating metrics:', error);
    return { keyCount: 0, totalBytes: 0, formattedSize: '0 KB' };
  }
}

/**
 * Clear all cache entries from memory and AsyncStorage
 */
export async function clearAllCache(queryClient = null) {
  try {
    if (queryClient) {
      queryClient.clear();
    }

    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(
      (k) => k.startsWith(CACHE_PREFIX) || k === QUERY_PERSIST_KEY || k.startsWith('@dorm_')
    );

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }

    return { success: true, count: cacheKeys.length };
  } catch (error) {
    console.warn('[CacheManager] Error clearing cache:', error);
    return { success: false, error };
  }
}

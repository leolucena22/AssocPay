/**
 * Simple in-memory cache (per serverless instance).
 *
 * Intended for short-lived caching of read-heavy, stable data (e.g. listings).
 * Each entry holds a value and an absolute expiry timestamp. Expired entries
 * are evicted lazily on read.
 *
 * Usage:
 * ```ts
 * import { cache } from "@/lib/cache";
 *
 * const hit = cache.get<MyType>("my-key");
 * if (hit) return hit;
 *
 * const data = await fetchSomething();
 * cache.set("my-key", data, 120); // TTL in seconds
 * return data;
 * ```
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Unix timestamp in ms
}

const store = new Map<string, CacheEntry<unknown>>();

function get<T>(key: string): T | null {
  const entry = store.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value as T;
}

function set<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1_000,
  });
}

/**
 * Removes all entries whose keys start with the given prefix.
 * Use this to invalidate a whole namespace (e.g. "institutions:").
 */
function invalidate(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

export const cache = { get, set, invalidate };

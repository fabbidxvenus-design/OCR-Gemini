const DEFAULT_TTL_MS = 5 * 60 * 1000;

function cacheError(operation: string, err: unknown): void {
  console.warn(`[Cache] ${operation} failed`, err instanceof Error ? err.message : err);
}

export function cachedGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; expiresAt: number };
    if (parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch (err) {
    cacheError('get', err);
    return null;
  }
}

export function cachedSet<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      expiresAt: Date.now() + ttlMs,
    }));
  } catch (err) {
    cacheError('set', err);
  }
}

export function cachedInvalidate(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    cacheError('invalidate', err);
  }
}

export function cachedInvalidateAllScanDetails(): void {
  try {
    const prefix = 'hlvn:cache:scans:detail:';
    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));
    keys.forEach((key) => {
      if (key?.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    cacheError('invalidateAll', err);
  }
}

export const CACHE_KEYS = {
  settings: 'hlvn:cache:settings',
  scansList: 'hlvn:cache:scans:list',
  scanDetail: (id: string) => `hlvn:cache:scans:detail:${id}`,
} as const;

export const CACHE_TTL = {
  scansList: 5 * 60 * 1000,
  settings: 10 * 60 * 1000,
  scanDetail: 10 * 60 * 1000,
} as const;
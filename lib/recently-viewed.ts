export const RECENTLY_VIEWED_KEY = "moment-recently-viewed";
export const RECENTLY_VIEWED_MAX = 6;

export function readRecentlyViewedHandles(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((handle): handle is string => typeof handle === "string")
      : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(handle: string): void {
  if (typeof window === "undefined") return;

  try {
    const existing = readRecentlyViewedHandles().filter((h) => h !== handle);
    const next = [handle, ...existing].slice(0, RECENTLY_VIEWED_MAX);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    // Private browsing — skip persistence for this session.
  }
}

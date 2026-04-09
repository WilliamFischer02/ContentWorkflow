export function relativeTime(timestamp: number): string {
  const elapsed = Date.now() - timestamp;
  if (elapsed < 30_000) return "just now";

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (elapsed < hour) return `${Math.floor(elapsed / minute)}m ago`;
  if (elapsed < day) return `${Math.floor(elapsed / hour)}h ago`;
  if (elapsed < week) return `${Math.floor(elapsed / day)}d ago`;
  return `${Math.floor(elapsed / week)}w ago`;
}

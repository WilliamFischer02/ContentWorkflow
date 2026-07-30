const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export interface DueInfo {
  label: string
  tone: 'overdue' | 'today' | 'soon' | 'later'
}

/** Human status for a due date: "Overdue 2d", "Due today", "Due in 3d", "Aug 14". */
export function describeDue(dueDate: number, now = Date.now()): DueInfo {
  const diffDays = Math.round((startOfDay(dueDate) - startOfDay(now)) / DAY_MS)
  if (diffDays < 0) {
    return { label: `Overdue ${Math.abs(diffDays)}d`, tone: 'overdue' }
  }
  if (diffDays === 0) return { label: 'Due today', tone: 'today' }
  if (diffDays === 1) return { label: 'Due tomorrow', tone: 'soon' }
  if (diffDays <= 7) return { label: `Due in ${diffDays}d`, tone: 'soon' }
  return {
    label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    tone: 'later',
  }
}

export function isDueWithin(dueDate: number, days: number, now = Date.now()): boolean {
  const diff = startOfDay(dueDate) - startOfDay(now)
  return diff <= days * DAY_MS
}

/** ms epoch → value for <input type="date"> in local time. */
export function toDateInputValue(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** <input type="date"> value → ms epoch anchored at local noon (DST-safe). */
export function fromDateInputValue(value: string): number | undefined {
  if (!value) return undefined
  const ts = new Date(`${value}T12:00:00`).getTime()
  return Number.isNaN(ts) ? undefined : ts
}

export function formatRelativeTime(ts: number, now = Date.now()): string {
  const diff = now - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
